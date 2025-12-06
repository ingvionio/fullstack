from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.services.analytics_service import (
    get_activity_metrics,
    get_analytics_summary,
    get_criteria_metrics,
    get_users_engagement,
    get_marks_metrics,
    get_points_metrics,
    get_users_metrics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def analytics_summary(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    top_limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)


@router.get("/user-activity")
async def analytics_activity(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await get_activity_metrics(db, start_date=start_date, end_date=end_date)


@router.get("/points-overview")
async def analytics_points(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    top_limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await get_points_metrics(db, start_date=start_date, end_date=end_date, top_limit=top_limit)


@router.get("/marks-overview")
async def analytics_marks(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    top_limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await get_marks_metrics(db, start_date=start_date, end_date=end_date, top_limit=top_limit)


@router.get("/users-top")
async def analytics_users(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    top_limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await get_users_metrics(db, start_date=start_date, end_date=end_date, top_limit=top_limit)


@router.get("/criteria-scores")
async def analytics_criteria(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await get_criteria_metrics(db, start_date=start_date, end_date=end_date)


@router.get("/users-top/engagement")
async def analytics_users_engagement(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    top_limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await get_users_engagement(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
