from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models import User
from app.services.security import verify_password


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User:
    """Find user by username or email and verify password."""

    result = await db.execute(select(User).where(or_(User.username == username, User.email == username)))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    return user
