from datetime import datetime

from pydantic import BaseModel, Field


class PointBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    industry_id: int
    sub_industry_id: int
    creator_id: int | None = None


class PointCreate(PointBase):
    pass


class PointRead(PointBase):
    id: int
    mark: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PointUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    industry_id: int | None = None
    sub_industry_id: int | None = None
    creator_id: int | None = None
