"""Service for retrieving user activity."""

from datetime import datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Achievement, Mark, Point, UserAchievement
from app.schemas.activity_schemas import ActivityRead, ActivityType
from app.services.gamification_service import XP_FOR_MARK_CREATION, XP_FOR_POINT_CREATION


async def get_user_activity(
    db: AsyncSession, user_id: int, limit: int = 50
) -> List[ActivityRead]:
    """
    Get recent user activity (points created, marks created, achievements unlocked).
    
    Returns activities sorted by timestamp (most recent first).
    """
    activities: List[ActivityRead] = []

    # Get points created by user
    points_result = await db.execute(
        select(Point)
        .where(Point.creator_id == user_id)
        .order_by(Point.created_at.desc())
        .limit(limit)
    )
    points = list(points_result.scalars().all())

    for point in points:
        activities.append(
            ActivityRead(
                type=ActivityType.POINT_CREATED,
                timestamp=point.created_at,
                title=f"Создана точка: {point.name}",
                description=f"Точка на карте создана",
                xp_gained=XP_FOR_POINT_CREATION if point.creator_id else None,
                point_id=point.id,
            )
        )

    # Get marks (reviews) created by user
    marks_result = await db.execute(
        select(Mark)
        .options(selectinload(Mark.point))
        .where(Mark.user_id == user_id)
        .order_by(Mark.created_at.desc())
        .limit(limit)
    )
    marks = list(marks_result.scalars().all())

    for mark in marks:
        point_name = mark.point.name if mark.point else "Неизвестная точка"
        activities.append(
            ActivityRead(
                type=ActivityType.MARK_CREATED,
                timestamp=mark.created_at,
                title=f"Оставлен отзыв: {point_name}",
                description=f"Оценка: {mark.total_score:.1f}",
                xp_gained=XP_FOR_MARK_CREATION if mark.user_id else None,
                point_id=mark.point_id,
            )
        )

    # Get achievements unlocked by user
    achievements_result = await db.execute(
        select(UserAchievement)
        .options(selectinload(UserAchievement.achievement))
        .where(
            UserAchievement.user_id == user_id,
            UserAchievement.is_completed == True,
            UserAchievement.completed_at.isnot(None),
        )
        .order_by(UserAchievement.completed_at.desc())
        .limit(limit)
    )
    user_achievements = list(achievements_result.scalars().all())

    for user_achievement in user_achievements:
        if user_achievement.completed_at and user_achievement.achievement:
            activities.append(
                ActivityRead(
                    type=ActivityType.ACHIEVEMENT_UNLOCKED,
                    timestamp=user_achievement.completed_at,
                    title=f"Получено достижение: {user_achievement.achievement.name}",
                    description=user_achievement.achievement.description,
                    xp_gained=user_achievement.achievement.xp_reward if user_achievement.achievement.xp_reward > 0 else None,
                    achievement_id=user_achievement.achievement_id,
                )
            )

    # Sort all activities by timestamp (most recent first)
    activities.sort(key=lambda x: x.timestamp, reverse=True)

    # Limit to requested number
    return activities[:limit]

