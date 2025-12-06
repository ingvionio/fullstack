from datetime import datetime

from pydantic import BaseModel, Field


class SubIndustryBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    base_score: float = Field(default=0.0)
    industry_id: int


class SubIndustryCreate(SubIndustryBase):
    pass


class SubIndustryRead(SubIndustryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
