import copy
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import current_user, optional_user
from ..db import Attempt, Lesson, Test, User, get_db

router = APIRouter(prefix="/api", tags=["content"])

TEST_KINDS = {"listening", "reading", "general-listening", "general-reading"}
LESSON_KINDS = {"vocab", "grammar", "stories", "speaking", "writing"}


def _norm(v) -> str:
    return re.sub(r"\s+", " ", str(v).strip().lower()).rstrip(".")


def iter_questions(data: dict):
    for part in data.get("parts", []):
        for q in part.get("questions", []):
            yield q


def is_correct(q: dict, given) -> bool:
    if given is None or given == "":
        return False
    expected = q.get("answer")
    accepted = expected if isinstance(expected, list) else [expected]
    return _norm(given) in {_norm(a) for a in accepted}


def public_test(t: Test, full: bool = False) -> dict:
    out = {"id": t.id, "kind": t.kind, "title": t.title, "level": t.level, "minutes": t.minutes,
           "questions": sum(1 for _ in iter_questions(t.data)), "parts": len(t.data.get("parts", []))}
    if full:
        data = copy.deepcopy(t.data)
        for q in iter_questions(data):
            q.pop("answer", None)
            q.pop("explanation", None)
        out["data"] = data
    return out


def public_lesson(l: Lesson, full: bool = False) -> dict:
    out = {"id": l.id, "kind": l.kind, "title": l.title, "level": l.level,
           "summary": (l.data or {}).get("summary", "")}
    if full:
        out["data"] = l.data
    return out


@router.get("/sections")
def sections(db: Session = Depends(get_db)):
    tests = dict(db.query(Test.kind, func.count(Test.id)).group_by(Test.kind).all())
    lessons = dict(db.query(Lesson.kind, func.count(Lesson.id)).group_by(Lesson.kind).all())
    return {**tests, **lessons}


@router.get("/tests")
def list_tests(kind: str, db: Session = Depends(get_db)):
    if kind not in TEST_KINDS:
        raise HTTPException(404, "Bo'lim topilmadi")
    return [public_test(t) for t in db.query(Test).filter(Test.kind == kind).order_by(Test.id)]


@router.get("/tests/{test_id}")
def get_test(test_id: int, db: Session = Depends(get_db)):
    t = db.get(Test, test_id)
    if not t:
        raise HTTPException(404, "Test topilmadi")
    return public_test(t, full=True)


class SubmitIn(BaseModel):
    answers: dict[str, str | None]


@router.post("/tests/{test_id}/submit")
def submit_test(test_id: int, body: SubmitIn, user: User | None = Depends(optional_user),
                db: Session = Depends(get_db)):
    t = db.get(Test, test_id)
    if not t:
        raise HTTPException(404, "Test topilmadi")
    results, score, total = [], 0, 0
    for q in iter_questions(t.data):
        qid = str(q["id"])
        given = body.answers.get(qid)
        ok = is_correct(q, given)
        total += 1
        score += ok
        exp = q.get("answer")
        results.append({"id": qid, "correct": ok, "given": given,
                        "answer": exp[0] if isinstance(exp, list) else exp,
                        "explanation": q.get("explanation", "")})
    if user:
        db.add(Attempt(user_id=user.id, test_id=t.id, score=score, total=total, answers=body.answers))
        db.commit()
    return {"score": score, "total": total, "results": results, "saved": bool(user)}


@router.get("/lessons")
def list_lessons(kind: str, db: Session = Depends(get_db)):
    if kind not in LESSON_KINDS:
        raise HTTPException(404, "Bo'lim topilmadi")
    return [public_lesson(l) for l in db.query(Lesson).filter(Lesson.kind == kind).order_by(Lesson.id)]


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    l = db.get(Lesson, lesson_id)
    if not l:
        raise HTTPException(404, "Dars topilmadi")
    return public_lesson(l, full=True)


@router.get("/results")
def top_results(db: Session = Depends(get_db)):
    """Recent best attempts for the public 'Natijalar' section."""
    rows = (
        db.query(User.name, Test.title, Test.kind, Attempt.score, Attempt.total)
        .join(User, User.id == Attempt.user_id)
        .join(Test, Test.id == Attempt.test_id)
        .order_by((Attempt.score * 1.0 / Attempt.total).desc(), Attempt.id.desc())
        .limit(8)
        .all()
    )
    return [{"name": n, "title": ti, "kind": k, "score": s, "total": to} for n, ti, k, s, to in rows]
