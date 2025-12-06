from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import CriteriaCreate, CriteriaRead
from app.services import create_criteria, delete_criteria, get_criteria, list_criteria

router = APIRouter(prefix="/criteria", tags=["criteria"])


@router.post("", response_model=CriteriaRead, status_code=status.HTTP_201_CREATED)
async def create_criteria_endpoint(payload: CriteriaCreate, db: AsyncSession = Depends(get_db)) -> CriteriaRead:
    return await create_criteria(db, payload)


@router.get("", response_model=List[CriteriaRead])
async def list_criteria_endpoint(
    industry_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> List[CriteriaRead]:
    return await list_criteria(db, industry_id=industry_id)


@router.get("/{criteria_id}", response_model=CriteriaRead)
async def get_criteria_endpoint(criteria_id: int, db: AsyncSession = Depends(get_db)) -> CriteriaRead:
    return await get_criteria(db, criteria_id)


@router.delete("/{criteria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_criteria_endpoint(criteria_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_criteria(db, criteria_id)
