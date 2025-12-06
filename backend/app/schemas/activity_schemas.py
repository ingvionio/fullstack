"""Schemas for user activity."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ActivityType(str, Enum):
    """Types of user activities that give XP."""

    POINT_CREATED = "point_created"
    MARK_CREATED = "mark_created"
    ACHIEVEMENT_UNLOCKED = "achievement_unlocked"


class ActivityRead(BaseModel):
    """Schema for user activity item."""

    type: ActivityType = Field(description="Type of activity")
    timestamp: datetime = Field(description="When the activity occurred")
    title: str = Field(description="Title/name of the activity")
    description: str | None = Field(default=None, description="Additional description")
    xp_gained: int | None = Field(default=None, description="XP gained from this activity")
    point_id: int | None = Field(default=None, description="ID of the point if applicable")
    achievement_id: int | None = Field(default=None, description="ID of the achievement if applicable")

    model_config = {"from_attributes": True}

