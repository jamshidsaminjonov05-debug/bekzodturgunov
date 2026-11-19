import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
# Vercel'da loyiha papkasi faqat o'qish uchun: Postgres ulanmagan bo'lsa, SQLite /tmp'da (vaqtinchalik) turadi
_default_db = "sqlite:////tmp/app.db" if os.getenv("VERCEL") else f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or _default_db
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Relative sqlite paths resolve against backend/ regardless of cwd
if DATABASE_URL.startswith("sqlite:///./"):
    DATABASE_URL = f"sqlite:///{(BASE_DIR / DATABASE_URL[len('sqlite:///./'):]).as_posix()}"
# Neon/Vercel Postgres "postgres://" beradi — SQLAlchemy uchun psycopg drayveriga o'tkazamiz
for _p in ("postgres://", "postgresql://"):
    if DATABASE_URL.startswith(_p):
        DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len(_p):]
        break
