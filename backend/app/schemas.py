from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "investor"

class UserLogin(BaseModel):
    email: str
    password: str

class VerifyOtp(BaseModel):
    email: str
    otp: str

class ResendOtp(BaseModel):
    email: str

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    email: str
    resetCode: str
    newPassword: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    isVerified: bool
    createdAt: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class WatchlistAdd(BaseModel):
    type: str
    value: Any

class WatchlistRemove(BaseModel):
    type: str
    value: Any
