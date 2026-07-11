from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import UserRole
from app.models import User


# Mock authentication: resolve the current user from the X-User-Id header.
# This is a development stand-in, not real auth (no passwords, tokens, or sessions).
def get_current_user(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="X-User-Id must be an integer")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Require that the current user is a host.
def get_current_host(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.host:
        raise HTTPException(status_code=403, detail="Host access required")
    return user


__all__ = ["get_db", "get_current_user", "get_current_host"]