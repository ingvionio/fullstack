from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import Criteria, Mark, Point, SubIndustry, User
from app.schemas import PointCreate, PointUpdate
from app.services.achievement_service import check_points_achievements
from app.services.gamification_service import add_xp_for_point_creation
from app.services.sub_industry_service import get_sub_industry
from app.services.industry_service import get_industry


async def create_point(db: AsyncSession, payload: PointCreate) -> Point:
    """Create a new point authored by an existing user."""

    if payload.creator_id:
        creator = await db.get(User, payload.creator_id)
        if not creator:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator user not found.")

    await get_industry(db, payload.industry_id)
    sub_industry = await get_sub_industry(db, payload.sub_industry_id)
    
    # Validate that sub_industry belongs to the selected industry
    if sub_industry.industry_id != payload.industry_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SubIndustry does not belong to the selected Industry.",
        )

    point = Point(
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        industry_id=payload.industry_id,
        sub_industry_id=payload.sub_industry_id,
        creator_id=payload.creator_id,
    )

    db.add(point)
    await db.commit()
    await db.refresh(point)
    
    # Award XP for creating a point
    await add_xp_for_point_creation(db, payload.creator_id)
    
    # Check achievements related to points
    await check_points_achievements(db, payload.creator_id)
    
    return point


async def get_point(db: AsyncSession, point_id: int) -> Point:
    """Return a point by id or raise 404."""

    point = await db.get(Point, point_id)
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Point not found.")
    return point


async def list_points(db: AsyncSession) -> list[Point]:
    """Return all points with their current average mark."""

    result = await db.execute(select(Point))
    return list(result.scalars().all())


async def recalculate_point_mark(db: AsyncSession, point_id: int) -> float:
    """Recompute and persist the average mark for a point."""

    average_result = await db.execute(select(func.avg(Mark.total_score)).where(Mark.point_id == point_id))
    user_average = average_result.scalar()
    point_result = await db.execute(
        select(Point).options(selectinload(Point.sub_industry)).where(Point.id == point_id)
    )
    point = point_result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Point not found.")

    if user_average is None:
        point.mark = float(point.sub_industry.base_score)
    else:
        point.mark = float((user_average + point.sub_industry.base_score) / 2)

    await db.commit()
    await db.refresh(point)
    return point.mark


async def update_point(db: AsyncSession, point_id: int, payload: PointUpdate) -> Point:
    """Update mutable fields of a point."""

    point = await get_point(db, point_id)

    if payload.name is not None:
        point.name = payload.name
    if payload.latitude is not None:
        point.latitude = payload.latitude
    if payload.longitude is not None:
        point.longitude = payload.longitude
    if payload.industry_id is not None:
        await get_industry(db, payload.industry_id)
        point.industry_id = payload.industry_id
    if payload.sub_industry_id is not None:
        sub_industry = await get_sub_industry(db, payload.sub_industry_id)
        # Validate that sub_industry belongs to the selected industry
        target_industry_id = payload.industry_id if payload.industry_id is not None else point.industry_id
        if sub_industry.industry_id != target_industry_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SubIndustry does not belong to the selected Industry.",
            )
        point.sub_industry_id = payload.sub_industry_id
    if payload.creator_id is not None:
        creator = await db.get(User, payload.creator_id)
        if not creator:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator user not found.")
        point.creator_id = payload.creator_id

    await db.commit()
    await db.refresh(point)
    return point


async def delete_point(db: AsyncSession, point_id: int) -> None:
    """Delete a point and its marks."""

    point = await get_point(db, point_id)
    await db.delete(point)
    await db.commit()


async def get_point_criteria(db: AsyncSession, point_id: int) -> list[Criteria]:
    """Get all criteria (questions) for a specific point based on its industry.
    
    Returns only criteria that belong to the same industry as the point.
    Filters criteria by matching the point's industry_id.
    """
    # Get the point (this will raise 404 if not found)
    point = await get_point(db, point_id)
    
    # Get criteria filtered by the point's industry_id
    # This ensures we only return criteria that match the point's industry
    criteria_result = await db.execute(
        select(Criteria).where(Criteria.industry_id == point.industry_id)
    )
    return list(criteria_result.scalars().all())
