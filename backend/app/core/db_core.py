from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


async def get_db():
    """FastAPI dependency yielding an async SQLAlchemy session."""

    async with SessionLocal() as db:
        yield db


async def init_db() -> None:
    """Create all tables on startup."""

    from app import models  # noqa: F401  # ensure models are imported

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
