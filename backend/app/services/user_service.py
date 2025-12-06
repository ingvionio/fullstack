from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.services.security import hash_password


async def create_user(db: AsyncSession, payload: UserCreate) -> User:
    """Create a new user ensuring unique username and email."""

    existing = await db.execute(
        select(User).where(or_(User.username == payload.username, User.email == payload.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with the same username or email already exists.",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        avatar_url=payload.avatar_url,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user(db: AsyncSession, user_id: int) -> User:
    """Return a user by id or raise 404."""

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


async def list_users(db: AsyncSession) -> list[User]:
    """Return all users."""

    result = await db.execute(select(User))
    return list(result.scalars().all())


async def update_user(db: AsyncSession, user_id: int, payload: UserUpdate) -> User:
    """Update username/email/password ensuring uniqueness."""

    user = await get_user(db, user_id)

    if payload.username or payload.email:
        conditions = []
        if payload.username:
            conditions.append(User.username == payload.username)
        if payload.email:
            conditions.append(User.email == payload.email)
        if conditions:
            existing = await db.execute(select(User).where(or_(*conditions), User.id != user_id))
            # Protect against accidental same-user match by excluding current id
            conflict = next((u for u in existing.scalars().all() if u.id != user_id), None)
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with the same username or email already exists.",
                )

    if payload.username is not None:
        user.username = payload.username
    if payload.email is not None:
        user.email = payload.email
    if payload.password is not None:
        user.hashed_password = hash_password(payload.password)
    if payload.avatar_url is not None:
        # сохраняем предыдущий аватар в историю
        if user.avatar_url:
            history = list(user.avatar_history or [])
            history.append(user.avatar_url)
            user.avatar_history = history
        user.avatar_url = payload.avatar_url

    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int) -> None:
    """Delete a user by id."""

    user = await get_user(db, user_id)
    await db.delete(user)
    await db.commit()
