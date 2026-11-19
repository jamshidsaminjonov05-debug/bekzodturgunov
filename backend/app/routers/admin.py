from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import admin_user
from ..db import Attempt, Contest, ContestEntry, ContestEvent, Lesson, Test, User, WritingCheck, get_db
from .contest import iso
from .content import LESSON_KINDS, TEST_KINDS

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(admin_user)])


class ItemIn(BaseModel):
    kind: str
    title: str = Field(min_length=1, max_length=200)
    level: str = ""
    minutes: int = 60
    data: dict


def _model(kind: str):
    if kind in TEST_KINDS:
        return Test
    if kind in LESSON_KINDS:
        return Lesson
    raise HTTPException(422, f"Noma'lum bo'lim: {kind}")


def _out(x) -> dict:
    d = {"id": x.id, "kind": x.kind, "title": x.title, "level": x.level, "data": x.data}
    if isinstance(x, Test):
        d["minutes"] = x.minutes
    return d


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {
        "users": db.query(func.count(User.id)).filter(User.is_admin.is_(False)).scalar(),
        "tests": db.query(func.count(Test.id)).scalar(),
        "lessons": db.query(func.count(Lesson.id)).scalar(),
        "attempts": db.query(func.count(Attempt.id)).scalar(),
        "writings": db.query(func.count(WritingCheck.id)).scalar(),
    }


@router.get("/items")
def items(kind: str, db: Session = Depends(get_db)):
    M = _model(kind)
    return [_out(x) for x in db.query(M).filter(M.kind == kind).order_by(M.id)]


@router.post("/items")
def create_item(body: ItemIn, db: Session = Depends(get_db)):
    M = _model(body.kind)
    fields = body.model_dump()
    if M is Lesson:
        fields.pop("minutes")
    x = M(**fields)
    db.add(x)
    db.commit()
    return _out(x)


@router.put("/items/{kind}/{item_id}")
def update_item(kind: str, item_id: int, body: ItemIn, db: Session = Depends(get_db)):
    M = _model(kind)
    x = db.get(M, item_id)
    if not x:
        raise HTTPException(404, "Topilmadi")
    x.title, x.level, x.data = body.title, body.level, body.data
    if M is Test:
        x.minutes = body.minutes
    db.commit()
    return _out(x)


@router.delete("/items/{kind}/{item_id}")
def delete_item(kind: str, item_id: int, db: Session = Depends(get_db)):
    M = _model(kind)
    x = db.get(M, item_id)
    if not x:
        raise HTTPException(404, "Topilmadi")
    if M is Test:
        db.query(Attempt).filter(Attempt.test_id == x.id).delete()
    db.delete(x)
    db.commit()
    return {"ok": True}


class ContestIn(BaseModel):
    title: str
    prize: str = ""
    starts_at: datetime
    join_minutes: int = Field(ge=1, le=600)
    duration_minutes: int = Field(ge=1, le=1440)
    seconds_per_question: int = Field(ge=3, le=120)
    questions: list[dict]


@router.get("/contest")
def get_contest(db: Session = Depends(get_db)):
    c = db.query(Contest).order_by(Contest.id.desc()).first()
    if not c:
        return None
    return {"id": c.id, "title": c.title, "prize": c.prize, "starts_at": iso(c.starts_at),
            "join_minutes": c.join_minutes, "duration_minutes": c.duration_minutes,
            "seconds_per_question": c.seconds_per_question, "questions": c.questions}


@router.put("/contest")
def save_contest(body: ContestIn, db: Session = Depends(get_db)):
    for i, q in enumerate(body.questions):
        if not {"word", "options", "answer"} <= q.keys() or not 0 <= int(q["answer"]) < len(q["options"]):
            raise HTTPException(422, f"{i + 1}-savol noto'g'ri: word, options, answer kerak")
    starts = body.starts_at
    if starts.tzinfo:
        starts = starts.astimezone(timezone.utc).replace(tzinfo=None)
    c = db.query(Contest).order_by(Contest.id.desc()).first()
    if not c:
        c = Contest()
        db.add(c)
    c.title, c.prize, c.starts_at = body.title, body.prize, starts
    c.join_minutes, c.duration_minutes = body.join_minutes, body.duration_minutes
    c.seconds_per_question, c.questions, c.is_active = body.seconds_per_question, body.questions, True
    db.commit()
    return {"ok": True, "id": c.id}


@router.post("/contest/reset")
def reset_contest(db: Session = Depends(get_db)):
    c = db.query(Contest).order_by(Contest.id.desc()).first()
    if c:
        db.query(ContestEntry).filter(ContestEntry.contest_id == c.id).delete()
        db.query(ContestEvent).filter(ContestEvent.contest_id == c.id).delete()
        db.commit()
    return {"ok": True}


@router.get("/users")
def users(db: Session = Depends(get_db)):
    rows = (
        db.query(User, func.count(Attempt.id))
        .outerjoin(Attempt, Attempt.user_id == User.id)
        .filter(User.is_admin.is_(False))
        .group_by(User.id)
        .order_by(User.id.desc())
        .limit(200)
        .all()
    )
    return [{"id": u.id, "name": u.name, "attempts": n, "created_at": iso(u.created_at)} for u, n in rows]
