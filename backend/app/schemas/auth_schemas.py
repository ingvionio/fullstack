from pydantic import BaseModel, Field

from app.schemas.user_schemas import UserRead


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=256)


class LoginResponse(BaseModel):
    user: UserRead
