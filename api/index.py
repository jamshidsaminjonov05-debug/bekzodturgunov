"""Vercel serverless kirish nuqtasi: backend/app dagi FastAPI ilovasi."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db import SessionLocal, init_db  # noqa: E402
from app.main import app  # noqa: E402,F401
from app.seed import seed  # noqa: E402

# Serverless'da lifespan har doim ishlamaydi — baza jadvallari va namuna kontentni import paytida tayyorlaymiz
init_db()
with SessionLocal() as _db:
    try:
        seed(_db)
    except Exception:  # bir vaqtda ikki nusxa ishga tushsa
        _db.rollback()
