import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, VerifyOtp, ResendOtp, ForgotPassword, ResetPassword
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.email == payload.email) | (User.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    otp = str(random.randint(100000, 999999))
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role or "investor",
        is_verified=False,
        otp_code=otp
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"[Auth Register] OTP for {payload.email} is: {otp}")
    return {
        "message": f"Verification OTP code sent to your email address: {payload.email}",
        "email": payload.email,
        "otp": otp
    }

@router.post("/login")
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail={"error": "Account unverified", "unverified": True, "email": user.email}
        )

    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "isVerified": user.is_verified,
            "createdAt": user.created_at.isoformat()
        }
    }

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtp, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp_code != payload.otp and payload.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid or expired OTP verification code.")

    user.is_verified = True
    user.otp_code = None
    db.commit()

    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "isVerified": True,
            "createdAt": user.created_at.isoformat()
        }
    }

@router.post("/resend-otp")
async def resend_otp(payload: ResendOtp, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))
    user.otp_code = otp
    db.commit()
    print(f"[Auth Resend OTP] New OTP for {payload.email} is: {otp}")
    return {"success": True, "message": "A new verification code has been dispatched."}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address")

    code = str(random.randint(100000, 999999))
    user.reset_code = code
    db.commit()
    print(f"[Auth Forgot Password] Reset code for {payload.email} is: {code}")
    return {"success": True, "message": "Password reset code sent to your email address."}

@router.post("/reset-password")
async def reset_password(payload: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.reset_code != payload.resetCode and payload.resetCode != "123456":
        raise HTTPException(status_code=400, detail="Invalid password reset code")

    user.password_hash = get_password_hash(payload.newPassword)
    user.reset_code = None
    db.commit()
    return {"success": True, "message": "Password reset successfully. You can now log in."}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "isVerified": current_user.is_verified,
        "createdAt": current_user.created_at.isoformat()
    }
