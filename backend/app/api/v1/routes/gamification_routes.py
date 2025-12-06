"""Routes for gamification features: user progress, levels, and XP."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas.gamification_schemas import UserProgress
from app.services.gamification_service import get_user_progress

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/users/{user_id}/progress", response_model=UserProgress)
async def get_user_progress_endpoint(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> UserProgress:
    """
    Get user progress information including level, XP, and progress to next level.
    
    Returns:
        UserProgress object with detailed progress information
    """
    try:
        progress = await get_user_progress(db, user_id)
        return UserProgress(**progress)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

