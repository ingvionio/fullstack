from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import Industry
from app.schemas import IndustryCreate


async def create_industry(db: AsyncSession, payload: IndustryCreate) -> Industry:
    existing = await db.execute(select(Industry).where(Industry.name == payload.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Industry already exists.")
    industry = Industry(name=payload.name)
    db.add(industry)
    await db.commit()
    await db.refresh(industry)
    return industry


async def list_industries(db: AsyncSession) -> list[Industry]:
    result = await db.execute(select(Industry))
    return list(result.scalars().all())


async def get_industry(db: AsyncSession, industry_id: int) -> Industry:
    industry = await db.get(Industry, industry_id)
    if not industry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found.")
    return industry


async def delete_industry(db: AsyncSession, industry_id: int) -> None:
    industry = await get_industry(db, industry_id)
    await db.delete(industry)
    await db.commit()
