from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import Criteria
from app.schemas import CriteriaCreate
from app.services.industry_service import get_industry


async def create_criteria(db: AsyncSession, payload: CriteriaCreate) -> Criteria:
    await get_industry(db, payload.industry_id)
    existing = await db.execute(
        select(Criteria).where(and_(Criteria.text == payload.text, Criteria.industry_id == payload.industry_id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Criteria with this text already exists in the industry."
        )
    crit = Criteria(text=payload.text, industry_id=payload.industry_id)
    db.add(crit)
    await db.commit()
    await db.refresh(crit)
    return crit


async def list_criteria(db: AsyncSession, industry_id: int | None = None) -> list[Criteria]:
    query = select(Criteria)
    if industry_id is not None:
        query = query.where(Criteria.industry_id == industry_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_criteria(db: AsyncSession, criteria_id: int) -> Criteria:
    crit = await db.get(Criteria, criteria_id)
    if not crit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Criteria not found.")
    return crit


async def delete_criteria(db: AsyncSession, criteria_id: int) -> None:
    crit = await get_criteria(db, criteria_id)
    await db.delete(crit)
    await db.commit()
