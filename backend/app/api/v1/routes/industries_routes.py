from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import IndustryCreate, IndustryRead
from app.services import create_industry, delete_industry, get_industry, list_industries

router = APIRouter(prefix="/industries", tags=["industries"])


@router.post("", response_model=IndustryRead, status_code=status.HTTP_201_CREATED)
async def create_industry_endpoint(payload: IndustryCreate, db: AsyncSession = Depends(get_db)) -> IndustryRead:
    return await create_industry(db, payload)


@router.get("", response_model=List[IndustryRead])
async def list_industries_endpoint(db: AsyncSession = Depends(get_db)) -> List[IndustryRead]:
    return await list_industries(db)


@router.get("/{industry_id}", response_model=IndustryRead)
async def get_industry_endpoint(industry_id: int, db: AsyncSession = Depends(get_db)) -> IndustryRead:
    return await get_industry(db, industry_id)


@router.delete("/{industry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_industry_endpoint(industry_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_industry(db, industry_id)
