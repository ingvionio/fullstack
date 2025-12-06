"""Schemas for gamification API responses."""

from pydantic import BaseModel, Field


class UserProgress(BaseModel):
    """User progress information including level and XP details."""
    
    current_level: int = Field(description="Current user level")
    current_xp: int = Field(description="Current total XP")
    xp_for_current_level: int = Field(description="XP required to reach current level")
    xp_for_next_level: int = Field(description="XP required to reach next level")
    xp_progress: int = Field(description="XP gained in current level")
    xp_needed: int = Field(description="XP needed to reach next level")
    progress_percentage: float = Field(description="Percentage progress to next level (0-100)")
    
    model_config = {"from_attributes": True}


class XPGained(BaseModel):
    """Response when XP is gained."""
    
    xp_gained: int = Field(description="Amount of XP gained")
    new_total_xp: int = Field(description="New total XP after gain")
    new_level: int = Field(description="New level after XP gain (may be same as before)")
    level_increased: bool = Field(description="Whether the level increased")
    
    model_config = {"from_attributes": True}

