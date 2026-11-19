from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .db import User, get_db


def _token(authorization: str | None) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def optional_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User | None:
    tok = _token(authorization)
    if not tok:
        return None
    return db.query(User).filter(User.token == tok).first()


def current_user(user: User | None = Depends(optional_user)) -> User:
    if not user:
        raise HTTPException(401, "Avval tizimga kiring")
    return user


def admin_user(user: User = Depends(current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Faqat admin uchun")
    return user


def user_out(u: User) -> dict:
    return {"id": u.id, "name": u.name, "is_admin": u.is_admin}
