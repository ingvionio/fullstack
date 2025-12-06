from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import Criteria, Mark, Point, User
from app.schemas import MarkCreate
from app.services.achievement_service import check_marks_achievements, check_streak_achievements
from app.services.gamification_service import add_xp_for_mark_creation
from app.services.point_service import recalculate_point_mark


async def _get_point_and_user(db: AsyncSession, point_id: int, user_id: int | None) -> tuple[Point, User | None]:
    point = await db.get(Point, point_id)
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Point not found.")
    user = None
    if user_id is not None:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return point, user


def _compute_total_score(answers: list[int], weights: list[float]) -> float:
    if len(answers) != len(weights):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Answers and weights must have the same length."
        )
    total = sum(a * w for a, w in zip(answers, weights))
    if sum(weights) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Сумма весов равна нулю!.")
    return total / sum(weights) 


async def create_mark(db: AsyncSession, payload: MarkCreate) -> Mark:
    """Create mark, ensuring criteria belong to point's industry, then recalc point mark."""

    point, _ = await _get_point_and_user(db, payload.point_id, payload.user_id)

    # validate criteria belong to the same industry
    if payload.question_ids:
        criteria_result = await db.execute(select(Criteria.id).where(Criteria.industry_id == point.industry_id))
        valid_ids = {cid for cid in criteria_result.scalars().all()}
        if not set(payload.question_ids).issubset(valid_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided criteria do not belong to the same industry as the point.",
            )

    total_score = _compute_total_score(payload.answers, payload.weights)

    mark = Mark(
        point_id=payload.point_id,
        user_id=payload.user_id,
        question_ids=payload.question_ids,
        answers=payload.answers,
        weights=payload.weights,
        comment=payload.comment,
        photos=payload.photos or [],
        total_score=total_score,
    )
    db.add(mark)
    await db.commit()
    await db.refresh(mark)

    await recalculate_point_mark(db, payload.point_id)
    
    # Award XP for creating a mark (review)
    await add_xp_for_mark_creation(db, payload.user_id)
    
    # Check achievements related to marks
    await check_marks_achievements(db, payload.user_id)
    await check_streak_achievements(db, payload.user_id)
    
    return mark


async def list_marks(db: AsyncSession, point_id: int | None = None) -> list[Mark]:
    query = select(Mark)
    if point_id is not None:
        query = query.where(Mark.point_id == point_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def list_user_comments(db: AsyncSession, user_id: int) -> list[Mark]:
    """Return all non-empty comments left by a specific user (newest first)."""

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    query = (
        select(Mark)
        .where(
            Mark.user_id == user_id,
            Mark.comment.is_not(None),
            Mark.comment != "",
        )
        .order_by(Mark.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_mark(db: AsyncSession, mark_id: int) -> Mark:
    mark = await db.get(Mark, mark_id)
    if not mark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mark not found.")
    return mark


async def append_photos_to_mark(db: AsyncSession, mark_id: int, urls: list[str]) -> Mark:
    mark = await get_mark(db, mark_id)
    photos = list(mark.photos or [])
    photos.extend(urls)
    mark.photos = photos
    await db.commit()
    await db.refresh(mark)
    return mark


async def delete_mark(db: AsyncSession, mark_id: int) -> None:
    mark = await get_mark(db, mark_id)
    point_id = mark.point_id
    await db.delete(mark)
    await db.commit()
    await recalculate_point_mark(db, point_id)
