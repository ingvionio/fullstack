from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, UniqueConstraint, JSON
from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db_core import Base
from app.models.my_types import (
    created_at,
    int_pk,
    json_list_float,
    json_list_int,
    json_list_str,
    str_255,
    text_col,
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int_pk]
    username: Mapped[str_255] = mapped_column(unique=True, nullable=False, index=True)
    email: Mapped[str_255] = mapped_column(unique=True, nullable=False, index=True)
    hashed_password: Mapped[str_255] = mapped_column(nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avatar_url: Mapped[Optional[str_255]] = mapped_column(nullable=True)
    avatar_history: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[created_at]

    points: Mapped[List["Point"]] = relationship(back_populates="creator", cascade="all, delete-orphan")
    marks: Mapped[List["Mark"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    user_achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Industry(Base):
    __tablename__ = "industries"

    id: Mapped[int_pk]
    name: Mapped[str_255] = mapped_column(String, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    sub_industries: Mapped[List["SubIndustry"]] = relationship(
        back_populates="industry", cascade="all, delete-orphan"
    )
    criteria: Mapped[List["Criteria"]] = relationship(back_populates="industry", cascade="all, delete-orphan")
    points: Mapped[List["Point"]] = relationship(back_populates="industry")


class SubIndustry(Base):
    __tablename__ = "sub_industries"

    id: Mapped[int_pk]
    name: Mapped[str_255] = mapped_column(String, nullable=False)
    base_score: Mapped[float] = mapped_column(Float, default=0.0)
    industry_id: Mapped[int] = mapped_column(ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    industry: Mapped["Industry"] = relationship(back_populates="sub_industries")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("name", "industry_id", name="uq_sub_industry_name_per_industry"),)

    points: Mapped[List["Point"]] = relationship(back_populates="sub_industry")


class Criteria(Base):
    __tablename__ = "criteria"

    id: Mapped[int_pk]
    text: Mapped[str_255] = mapped_column(String, nullable=False)
    industry_id: Mapped[int] = mapped_column(ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    industry: Mapped["Industry"] = relationship(back_populates="criteria")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("text", "industry_id", name="uq_criteria_text_per_industry"),)


class Point(Base):
    __tablename__ = "points"

    id: Mapped[int_pk]
    name: Mapped[str_255] = mapped_column(nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    mark: Mapped[float] = mapped_column(Float, default=0.0)  # общий рейтинг точки
    industry_id: Mapped[int] = mapped_column(ForeignKey("industries.id"), nullable=False)
    sub_industry_id: Mapped[int] = mapped_column(ForeignKey("sub_industries.id"), nullable=False)
    creator_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,  # client-side fallback when DB lacks server default
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    industry: Mapped["Industry"] = relationship(back_populates="points")
    sub_industry: Mapped["SubIndustry"] = relationship(back_populates="points")
    evaluations: Mapped[List["Mark"]] = relationship(back_populates="point", cascade="all, delete-orphan")
    creator: Mapped[Optional["User"]] = relationship(back_populates="points")


class Mark(Base):
    __tablename__ = "marks"

    id: Mapped[int_pk]
    point_id: Mapped[int] = mapped_column(ForeignKey("points.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    question_ids: Mapped[json_list_int] = mapped_column(nullable=False)
    answers: Mapped[json_list_int] = mapped_column(nullable=False)
    weights: Mapped[json_list_float] = mapped_column(nullable=False)
    comment: Mapped[Optional[text_col]] = mapped_column(nullable=True)
    photos: Mapped[json_list_str] = mapped_column(nullable=False, default=list)
    total_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,  # client-side default so inserts work even if DB lacks server default
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    point: Mapped["Point"] = relationship(back_populates="evaluations")
    user: Mapped[Optional["User"]] = relationship(back_populates="marks")
