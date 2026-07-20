from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Auth ----------
class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Reports ----------
class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    file_name: str
    file_type: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    summary: Optional[str] = None
    uploaded_at: datetime


class ReportDetailOut(ReportOut):
    extracted_text: Optional[str] = None


class ReportListResponse(BaseModel):
    total: int
    items: list[ReportOut]


# ---------- Generic API envelope ----------
class ApiError(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None
