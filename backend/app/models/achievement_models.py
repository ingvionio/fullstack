"""Models for achievement system."""

from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db_core import Base
from app.models.my_types import created_at, int_pk, str_255, str_64


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int_pk]
    name: Mapped[str_255] = mapped_column(nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    achievement_type: Mapped[str_64] = mapped_column(nullable=False, index=True)  # marks_count, points_count, marks_streak
    requirement_value: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g., 10 reviews, 10 days streak
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[created_at]

    user_achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # Current progress towards achievement
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[created_at]

    user: Mapped["User"] = relationship(back_populates="user_achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")

