from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import UserRole
from app.models import User
from app.services.auth_service import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# Resolve the current user from a JWT Bearer token.
def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_access_token(token)
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# Require that the current user is a host.
def get_current_host(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.host:
        raise HTTPException(status_code=403, detail="Host access required")
    return user


__all__ = ["get_db", "get_current_user", "get_current_host"]