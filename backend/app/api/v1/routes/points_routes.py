from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import CriteriaRead, PointCreate, PointRead, PointUpdate
from app.services import create_point, delete_point, get_point, get_point_criteria, list_points, update_point

router = APIRouter(prefix="/points", tags=["points"])


@router.post("", response_model=PointRead, status_code=status.HTTP_201_CREATED)
async def create_point_endpoint(payload: PointCreate, db: AsyncSession = Depends(get_db)) -> PointRead:
    return await create_point(db, payload)


@router.get("", response_model=List[PointRead])
async def list_points_endpoint(db: AsyncSession = Depends(get_db)) -> List[PointRead]:
    return await list_points(db)


@router.get("/{point_id}/criteria", response_model=List[CriteriaRead])
async def get_point_criteria_endpoint(
    point_id: int, db: AsyncSession = Depends(get_db)
) -> List[CriteriaRead]:
    """
    Get all criteria (questions) for a specific point.
    Returns all criteria that belong to the point's industry.
    """
    criteria = await get_point_criteria(db, point_id)
    return [CriteriaRead.model_validate(c) for c in criteria]


@router.get("/{point_id}", response_model=PointRead)
async def retrieve_point(point_id: int, db: AsyncSession = Depends(get_db)) -> PointRead:
    return await get_point(db, point_id)


@router.patch("/{point_id}", response_model=PointRead)
async def update_point_endpoint(
    point_id: int, payload: PointUpdate, db: AsyncSession = Depends(get_db)
) -> PointRead:
    return await update_point(db, point_id, payload)


@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_point_endpoint(point_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_point(db, point_id)
