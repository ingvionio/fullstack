from datetime import datetime

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def _set_timestamps(session, flush_context, _instances):
    """Ensure created_at/updated_at are always populated before flush."""

    now = datetime.utcnow()

    for obj in session.new:
        if hasattr(obj, "created_at") and getattr(obj, "created_at") is None:
            setattr(obj, "created_at", now)
        if hasattr(obj, "updated_at") and getattr(obj, "updated_at") is None:
            setattr(obj, "updated_at", now)

    for obj in session.dirty:
        if hasattr(obj, "updated_at"):
            setattr(obj, "updated_at", now)


# Attach the listener to the sync Session class used under AsyncSession.
event.listen(Session, "before_flush", _set_timestamps)


async def get_db():
    """FastAPI dependency yielding an async SQLAlchemy session."""

    async with SessionLocal() as db:
        yield db


async def init_db() -> None:
    """Create all tables on startup."""

    from app import models  # noqa: F401  # ensure models are imported

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
