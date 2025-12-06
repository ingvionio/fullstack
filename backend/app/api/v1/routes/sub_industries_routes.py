from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import SubIndustryCreate, SubIndustryRead
from app.services import create_sub_industry, delete_sub_industry, get_sub_industry, list_sub_industries

router = APIRouter(prefix="/sub-industries", tags=["sub-industries"])


@router.post("", response_model=SubIndustryRead, status_code=status.HTTP_201_CREATED)
async def create_sub_industry_endpoint(
    payload: SubIndustryCreate, db: AsyncSession = Depends(get_db)
) -> SubIndustryRead:
    return await create_sub_industry(db, payload)


@router.get("", response_model=List[SubIndustryRead])
async def list_sub_industries_endpoint(
    industry_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> List[SubIndustryRead]:
    return await list_sub_industries(db, industry_id=industry_id)


@router.get("/{sub_industry_id}", response_model=SubIndustryRead)
async def get_sub_industry_endpoint(sub_industry_id: int, db: AsyncSession = Depends(get_db)) -> SubIndustryRead:
    return await get_sub_industry(db, sub_industry_id)


@router.delete("/{sub_industry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sub_industry_endpoint(sub_industry_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_sub_industry(db, sub_industry_id)
