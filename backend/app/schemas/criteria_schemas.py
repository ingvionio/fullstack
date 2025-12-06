from datetime import datetime

from pydantic import BaseModel, Field


class CriteriaBase(BaseModel):
    text: str = Field(min_length=1, max_length=255)
    industry_id: int


class CriteriaCreate(CriteriaBase):
    pass


class CriteriaRead(CriteriaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
