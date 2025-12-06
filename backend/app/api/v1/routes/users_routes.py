from typing import List

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import ActivityRead, UserCommentRead, UserCreate, UserRead, UserUpdate
from app.services import (
    create_user,
    delete_user,
    get_user,
    get_user_activity,
    list_user_comments,
    list_users,
    save_user_avatar,
    update_user,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> UserRead:
    return await create_user(db, payload)


@router.get("/{user_id}/activity", response_model=List[ActivityRead])
async def get_user_activity_endpoint(
    user_id: int,
    limit: int = Query(default=50, ge=1, le=100, description="Maximum number of activities to return"),
    db: AsyncSession = Depends(get_db),
) -> List[ActivityRead]:
    """
    Get recent user activity (points created, marks created, achievements unlocked).
    Returns activities sorted by timestamp (most recent first).
    """
    return await get_user_activity(db, user_id, limit)


@router.get("/{user_id}/comments", response_model=List[UserCommentRead])
async def get_user_comments_endpoint(user_id: int, db: AsyncSession = Depends(get_db)) -> List[UserCommentRead]:
    """Return all comments left by the specified user."""

    return await list_user_comments(db, user_id)


@router.get("/{user_id}", response_model=UserRead)
async def retrieve_user(user_id: int, db: AsyncSession = Depends(get_db)) -> UserRead:
    return await get_user(db, user_id)


@router.get("", response_model=list[UserRead])
async def list_users_endpoint(db: AsyncSession = Depends(get_db)) -> list[UserRead]:
    return await list_users(db)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user_endpoint(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)) -> UserRead:
    return await update_user(db, user_id, payload)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(user_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_user(db, user_id)


@router.post("/{user_id}/avatar", response_model=UserRead)
async def upload_avatar(
    user_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
) -> UserRead:
    user = await get_user(db, user_id)
    new_url = save_user_avatar(user_id, file)
    # push current to history
    if user.avatar_url:
        history = list(user.avatar_history or [])
        history.append(user.avatar_url)
        user.avatar_history = history
    user.avatar_url = new_url
    await db.commit()
    await db.refresh(user)
    return user
