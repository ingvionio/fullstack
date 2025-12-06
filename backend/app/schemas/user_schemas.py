from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    avatar_url: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=256)


class UserRead(UserBase):
    id: int
    level: int
    xp: int
    avatar_history: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=64)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=256)
    avatar_url: str | None = Field(default=None, max_length=255)
