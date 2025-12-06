from datetime import datetime

from pydantic import BaseModel, Field


class IndustryBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class IndustryCreate(IndustryBase):
    pass


class IndustryRead(IndustryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
