from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class MarkBase(BaseModel):
    point_id: int
    user_id: int | None = None
    question_ids: List[int]
    answers: List[int]
    weights: List[float]
    comment: str | None = Field(default=None, max_length=2000)
    photos: List[str] = Field(default_factory=list)


class MarkCreate(MarkBase):
    pass


class MarkRead(MarkBase):
    id: int
    total_score: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserCommentRead(BaseModel):
    """Public comment info for a user's reviews."""

    id: int
    point_id: int
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}
