from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import current_user, optional_user
from ..db import Contest, ContestEntry, ContestEvent, User, get_db, utcnow

router = APIRouter(prefix="/api/contest", tags=["contest"])

POINTS = {"A2": 1, "B1": 2, "B2": 3, "C1": 4, "C2": 5}
GRACE = 2  # seconds for network latency
MAX_LEAVES = 3


def iso(dt: datetime | None) -> str | None:
    return dt.isoformat() + "Z" if dt else None


def get_contest(db: Session) -> Contest:
    c = db.query(Contest).filter(Contest.is_active.is_(True)).order_by(Contest.id.desc()).first()
    if not c:
        raise HTTPException(404, "Faol musobaqa yo'q")
    return c


def phase(c: Contest, now: datetime) -> str:
    if now < c.starts_at:
        return "upcoming"
    if now < c.starts_at + timedelta(minutes=c.join_minutes):
        return "open"
    if now < c.starts_at + timedelta(minutes=c.duration_minutes):
        return "running"
    return "finished"


def max_points(c: Contest) -> int:
    return sum(POINTS.get(q.get("level", "B1"), 2) for q in c.questions)


def event(db: Session, c: Contest, text: str):
    db.add(ContestEvent(contest_id=c.id, text=text))


def finish(db: Session, c: Contest, e: ContestEntry, user: User, now: datetime, reason: str = ""):
    if e.finished_at:
        return
    e.finished_at = now
    e.question_sent_at = None
    if not user.is_admin:
        event(db, c, f"{user.name} yakunladi — {e.score} ball" + (f" ({reason})" if reason else ""))


def entry_out(c: Contest, e: ContestEntry | None) -> dict | None:
    if not e:
        return None
    return {"score": e.score, "correct": e.correct, "wrong": e.wrong, "index": e.index,
            "total": len(c.questions), "leaves": e.leaves, "finished": e.finished_at is not None,
            "disqualified": e.disqualified}


def ranked(db: Session, c: Contest):
    rows = (
        db.query(ContestEntry, User)
        .join(User, User.id == ContestEntry.user_id)
        .filter(ContestEntry.contest_id == c.id, User.is_admin.is_(False), ContestEntry.disqualified.is_(False))
        .all()
    )
    now = utcnow()

    def elapsed(e: ContestEntry) -> float:
        return ((e.finished_at or now) - e.started_at).total_seconds()

    rows.sort(key=lambda r: (-r[0].score, elapsed(r[0])))
    return rows, elapsed


@router.get("")
def info(user: User | None = Depends(optional_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    now = utcnow()
    e = None
    if user:
        e = db.query(ContestEntry).filter_by(contest_id=c.id, user_id=user.id).first()
    levels: dict[str, int] = {}
    for q in c.questions:
        levels[q.get("level", "B1")] = levels.get(q.get("level", "B1"), 0) + 1
    return {
        "id": c.id, "title": c.title, "prize": c.prize, "phase": phase(c, now),
        "starts_at": iso(c.starts_at),
        "join_until": iso(c.starts_at + timedelta(minutes=c.join_minutes)),
        "ends_at": iso(c.starts_at + timedelta(minutes=c.duration_minutes)),
        "server_now": iso(now),
        "questions": len(c.questions), "seconds_per_question": c.seconds_per_question,
        "max_points": max_points(c), "points": POINTS, "levels": levels, "max_leaves": MAX_LEAVES,
        "entry": entry_out(c, e),
    }


@router.post("/join")
def join(user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    now = utcnow()
    e = db.query(ContestEntry).filter_by(contest_id=c.id, user_id=user.id).first()
    if e:
        return entry_out(c, e)
    if phase(c, now) != "open" and not user.is_admin:
        raise HTTPException(400, "Hozir musobaqaga kirish yopiq")
    e = ContestEntry(contest_id=c.id, user_id=user.id, started_at=now)
    db.add(e)
    if not user.is_admin:
        event(db, c, f"{user.name} musobaqaga qo'shildi")
    db.commit()
    return entry_out(c, e)


def _entry(db: Session, c: Contest, user: User) -> ContestEntry:
    e = db.query(ContestEntry).filter_by(contest_id=c.id, user_id=user.id).first()
    if not e:
        raise HTTPException(400, "Avval musobaqaga qo'shiling")
    return e


def _sync(db: Session, c: Contest, e: ContestEntry, user: User, now: datetime):
    """Skip a timed-out question, and finish when out of questions or time."""
    if e.finished_at:
        return
    end = c.starts_at + timedelta(minutes=c.duration_minutes)
    if now >= end and not user.is_admin:
        finish(db, c, e, user, now, "vaqt tugadi")
        return
    if e.question_sent_at and (now - e.question_sent_at).total_seconds() > c.seconds_per_question + GRACE:
        e.index += 1  # no answer → 0 points
        e.question_sent_at = None
    if e.index >= len(c.questions):
        finish(db, c, e, user, now)


@router.get("/question")
def question(user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    e = _entry(db, c, user)
    now = utcnow()
    _sync(db, c, e, user, now)
    if e.finished_at:
        db.commit()
        return {"done": True, "entry": entry_out(c, e)}
    if not e.question_sent_at:
        e.question_sent_at = now
    db.commit()
    q = c.questions[e.index]
    left = c.seconds_per_question - (now - e.question_sent_at).total_seconds()
    return {
        "done": False, "index": e.index, "word": q["word"], "options": q["options"],
        "level": q.get("level", "B1"), "points": POINTS.get(q.get("level", "B1"), 2),
        "seconds_left": max(0, round(left, 1)), "entry": entry_out(c, e),
    }


class AnswerIn(BaseModel):
    index: int
    option: int


@router.post("/answer")
def answer(body: AnswerIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    e = _entry(db, c, user)
    now = utcnow()
    if e.finished_at:
        raise HTTPException(400, "Siz allaqachon yakunlagansiz")
    if body.index != e.index or not e.question_sent_at:
        raise HTTPException(409, "Savol yangilandi")
    q = c.questions[e.index]
    pts = POINTS.get(q.get("level", "B1"), 2)
    timed_out = (now - e.question_sent_at).total_seconds() > c.seconds_per_question + GRACE
    ok = (not timed_out) and body.option == q["answer"]
    delta = 0 if timed_out else (pts if ok else -pts)
    e.score += delta
    e.correct += ok
    e.wrong += (not ok and not timed_out)
    e.index += 1
    e.question_sent_at = None
    if e.index >= len(c.questions):
        finish(db, c, e, user, now)
    db.commit()
    return {"correct": ok, "timed_out": timed_out, "answer": q["answer"], "delta": delta, "entry": entry_out(c, e)}


@router.post("/leave")
def leave(user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    e = _entry(db, c, user)
    if e.finished_at:
        return entry_out(c, e)
    e.leaves += 1
    if e.leaves >= MAX_LEAVES:
        e.disqualified = True
        finish(db, c, e, user, utcnow(), "chetlatildi")
    db.commit()
    return entry_out(c, e)


@router.get("/leaderboard")
def leaderboard(user: User | None = Depends(optional_user), db: Session = Depends(get_db)):
    c = get_contest(db)
    rows, elapsed = ranked(db, c)
    top = [
        {"rank": i + 1, "name": u.name, "score": e.score, "correct": e.correct,
         "question": min(e.index + (0 if e.finished_at else 1), len(c.questions)),
         "seconds": round(elapsed(e)), "finished": e.finished_at is not None, "me": bool(user and u.id == user.id)}
        for i, (e, u) in enumerate(rows)
    ]
    me = next((r for r in top if r["me"]), None)
    events = (
        db.query(ContestEvent).filter(ContestEvent.contest_id == c.id)
        .order_by(ContestEvent.id.desc()).limit(15).all()
    )
    return {
        "top": top[:10],
        "me": me,
        "stats": {
            "registered": len(rows),
            "solving": sum(1 for e, _ in rows if not e.finished_at),
            "finished": sum(1 for e, _ in rows if e.finished_at),
            "best": max((e.score for e, _ in rows), default=0),
        },
        "events": [{"text": ev.text, "at": iso(ev.created_at)} for ev in events],
    }
