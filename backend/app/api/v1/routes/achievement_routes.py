"""Routes for achievement features."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas.achievement_schemas import AchievementProgress, AchievementRead, UserAchievementWithDetails
from app.services.achievement_service import (
    get_achievement,
    get_all_achievements_with_user_progress,
    get_user_achievements,
    list_achievements,
)

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementRead])
async def list_achievements_endpoint(
    db: AsyncSession = Depends(get_db),
) -> list[AchievementRead]:
    """
    List all available achievements.
    
    Returns:
        List of all achievements in the system
    """
    achievements = await list_achievements(db)
    return [AchievementRead.model_validate(achievement) for achievement in achievements]


@router.get("/{achievement_id}", response_model=AchievementRead)
async def get_achievement_endpoint(
    achievement_id: int,
    db: AsyncSession = Depends(get_db),
) -> AchievementRead:
    """
    Get a specific achievement by ID.
    
    Returns:
        Achievement details
    """
    try:
        achievement = await get_achievement(db, achievement_id)
        return AchievementRead.model_validate(achievement)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/users/{user_id}/achievements", response_model=list[AchievementProgress])
async def get_user_achievements_endpoint(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> list[AchievementProgress]:
    """
    Get all achievements with progress for a specific user.
    Returns all achievements with current progress, even if user hasn't started them yet.
    
    Args:
        user_id: User ID
    
    Returns:
        List of achievements with user progress
    """
    achievements_with_progress = await get_all_achievements_with_user_progress(db, user_id)
    
    result = []
    for item in achievements_with_progress:
        result.append(AchievementProgress(
            achievement=AchievementRead.model_validate(item["achievement"]),
            progress=item["progress"],
            current_progress=item["current_progress"],
            is_completed=item["is_completed"],
            completed_at=item["completed_at"],
            requirement_value=item["requirement_value"],
            xp_reward=item["xp_reward"],
        ))
    
    return result

