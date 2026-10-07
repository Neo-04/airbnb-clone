from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models import User
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserOut
from app.services import auth_service

router = APIRouter(prefix=f"{settings.api_prefix}/auth", tags=["Auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        avatar_url=user.avatar_url,
    )


@router.post("/signup", response_model=AuthResponse, status_code=201, summary="Create a new account")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, payload)
    token = auth_service.create_access_token(user.id)
    return AuthResponse(access_token=token, user=_user_out(user))


@router.post("/login", response_model=AuthResponse, summary="Log in with email and password")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    token = auth_service.create_access_token(user.id)
    return AuthResponse(access_token=token, user=_user_out(user))


@router.get("/me", response_model=UserOut, summary="Get current authenticated user")
def me(user: User = Depends(get_current_user)):
    return _user_out(user)
