"""Schemas for achievement API responses."""

from datetime import datetime

from pydantic import BaseModel, Field


class AchievementBase(BaseModel):
    """Base achievement schema."""
    
    name: str = Field(description="Achievement name")
    description: str = Field(description="Achievement description")
    achievement_type: str = Field(description="Type of achievement (marks_count, points_count, marks_streak)")
    requirement_value: int = Field(description="Required value to complete achievement")
    xp_reward: int = Field(description="XP reward for completing achievement")


class AchievementRead(AchievementBase):
    """Achievement read schema."""
    
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserAchievementRead(BaseModel):
    """User achievement progress schema."""
    
    id: int
    user_id: int
    achievement_id: int
    progress: int = Field(description="Current progress towards achievement")
    is_completed: bool = Field(description="Whether achievement is completed")
    completed_at: datetime | None = Field(description="Date when achievement was completed")
    created_at: datetime
    
    # Include achievement details
    achievement: AchievementRead | None = None
    
    model_config = {"from_attributes": True}


class UserAchievementWithDetails(UserAchievementRead):
    """User achievement with full achievement details."""
    
    achievement: AchievementRead
    
    model_config = {"from_attributes": True}


class AchievementUnlocked(BaseModel):
    """Response when an achievement is unlocked."""
    
    achievement_id: int
    achievement_name: str
    xp_gained: int
    message: str
    
    model_config = {"from_attributes": True}


class AchievementProgress(BaseModel):
    """Achievement with user progress information."""
    
    achievement: AchievementRead
    progress: int = Field(description="Current progress towards achievement")
    current_progress: int = Field(description="Current actual progress (may differ from stored progress)")
    is_completed: bool = Field(description="Whether achievement is completed")
    completed_at: datetime | None = Field(description="Date when achievement was completed", default=None)
    requirement_value: int = Field(description="Required value to complete achievement")
    xp_reward: int = Field(description="XP reward for completing achievement")
    
    model_config = {"from_attributes": True}

