import json
import re

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import current_user
from ..config import OLLAMA_MODEL, OLLAMA_URL
from ..db import User, WritingCheck, get_db

router = APIRouter(prefix="/api/writing", tags=["writing"])

TASKS = {
    "1.1": ("Task 1.1 — informal letter/message to a friend", 50),
    "1.2": ("Task 1.2 — formal letter/email", 120),
    "2": ("Part 2 — opinion essay", 180),
}

SYSTEM = """You are an experienced CEFR Multilevel (Uzbekistan) writing examiner.
Assess the candidate's text strictly but fairly and answer ONLY with JSON of this shape:
{
  "level": "A2|B1|B2|C1",
  "score": <integer 0-100>,
  "criteria": {
    "task": {"score": <0-10>, "comment": "<uzbek>"},
    "coherence": {"score": <0-10>, "comment": "<uzbek>"},
    "vocabulary": {"score": <0-10>, "comment": "<uzbek>"},
    "grammar": {"score": <0-10>, "comment": "<uzbek>"}
  },
  "summary": "<2-3 sentences of overall feedback in Uzbek (Latin script)>",
  "mistakes": [{"original": "<exact fragment>", "correction": "<fixed>", "explanation": "<uzbek>"}],
  "improved": "<the candidate's text rewritten at C1 level, in English>"
}
Comments, summary and explanations must be in Uzbek (Latin script). List at most 8 mistakes."""


class CheckIn(BaseModel):
    task_type: str = Field(pattern=r"^(1\.1|1\.2|2)$")
    prompt: str = Field(min_length=5, max_length=3000)
    text: str = Field(min_length=20, max_length=6000)


def _parse(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw, re.S)
        if m:
            return json.loads(m.group(0))
        raise


@router.get("/status")
async def status():
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get(f"{OLLAMA_URL}/api/tags")
            names = [m["name"] for m in r.json().get("models", [])]
        return {"online": True, "model": OLLAMA_MODEL, "available": OLLAMA_MODEL in names}
    except Exception:
        return {"online": False, "model": OLLAMA_MODEL, "available": False}


@router.post("/check")
async def check(body: CheckIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    label, min_words = TASKS[body.task_type]
    words = len(body.text.split())
    user_msg = (
        f"Task type: {label} (recommended minimum {min_words} words).\n"
        f"Task prompt:\n{body.prompt}\n\n"
        f"Candidate's answer ({words} words):\n{body.text}"
    )
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.2},
        "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": user_msg}],
    }
    try:
        async with httpx.AsyncClient(timeout=300) as c:
            r = await c.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            result = _parse(r.json()["message"]["content"])
    except httpx.ConnectError:
        raise HTTPException(503, "Ollama ishlamayapti. `ollama serve` buyrug'ini ishga tushiring.")
    except (httpx.HTTPError, KeyError, json.JSONDecodeError) as e:
        raise HTTPException(502, f"AI javobini o'qib bo'lmadi: {e}")

    result["words"] = words
    result["min_words"] = min_words
    db.add(WritingCheck(user_id=user.id, task_type=body.task_type, prompt=body.prompt,
                        text=body.text, result=result))
    db.commit()
    return result
