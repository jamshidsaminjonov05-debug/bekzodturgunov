import hmac
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import current_user, user_out
from ..config import ADMIN_PASSWORD
from ..db import Attempt, Test, User, WritingCheck, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    name: str = Field(min_length=2, max_length=40)


class AdminIn(BaseModel):
    password: str


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    name = " ".join(body.name.split())
    if len(name) < 2:
        raise HTTPException(422, "Ism kamida 2 ta harf bo'lsin")
    user = User(name=name, token=secrets.token_hex(24))
    db.add(user)
    db.commit()
    return {"token": user.token, "user": user_out(user)}


@router.post("/admin")
def admin_login(body: AdminIn, db: Session = Depends(get_db)):
    if not hmac.compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        raise HTTPException(401, "Parol noto'g'ri")
    user = db.query(User).filter(User.is_admin.is_(True)).first()
    if not user:
        user = User(name="Admin", token=secrets.token_hex(24), is_admin=True)
        db.add(user)
    else:
        user.token = secrets.token_hex(24)
    db.commit()
    return {"token": user.token, "user": user_out(user)}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return user_out(user)


@router.get("/history")
def history(user: User = Depends(current_user), db: Session = Depends(get_db)):
    attempts = (
        db.query(Attempt, Test)
        .join(Test, Test.id == Attempt.test_id)
        .filter(Attempt.user_id == user.id)
        .order_by(Attempt.id.desc())
        .limit(50)
        .all()
    )
    writings = (
        db.query(WritingCheck)
        .filter(WritingCheck.user_id == user.id)
        .order_by(WritingCheck.id.desc())
        .limit(20)
        .all()
    )
    return {
        "attempts": [
            {"id": a.id, "test_id": t.id, "title": t.title, "kind": t.kind, "score": a.score,
             "total": a.total, "created_at": a.created_at.isoformat() + "Z"}
            for a, t in attempts
        ],
        "writings": [
            {"id": w.id, "task_type": w.task_type, "level": (w.result or {}).get("level"),
             "score": (w.result or {}).get("score"), "created_at": w.created_at.isoformat() + "Z"}
            for w in writings
        ],
    }
