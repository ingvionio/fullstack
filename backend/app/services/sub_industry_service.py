from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import SubIndustry
from app.schemas import SubIndustryCreate
from app.services.industry_service import get_industry


async def create_sub_industry(db: AsyncSession, payload: SubIndustryCreate) -> SubIndustry:
    await get_industry(db, payload.industry_id)
    existing = await db.execute(
        select(SubIndustry).where(and_(SubIndustry.name == payload.name, SubIndustry.industry_id == payload.industry_id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SubIndustry with this name already exists in the industry.",
        )
    sub = SubIndustry(name=payload.name, base_score=payload.base_score, industry_id=payload.industry_id)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub


async def list_sub_industries(db: AsyncSession, industry_id: int | None = None) -> list[SubIndustry]:
    query = select(SubIndustry)
    if industry_id is not None:
        query = query.where(SubIndustry.industry_id == industry_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_sub_industry(db: AsyncSession, sub_id: int) -> SubIndustry:
    sub = await db.get(SubIndustry, sub_id)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SubIndustry not found.")
    return sub


async def delete_sub_industry(db: AsyncSession, sub_id: int) -> None:
    sub = await get_sub_industry(db, sub_id)
    await db.delete(sub)
    await db.commit()
