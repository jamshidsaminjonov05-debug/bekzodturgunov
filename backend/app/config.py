import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Relative sqlite paths resolve against backend/ regardless of cwd
if DATABASE_URL.startswith("sqlite:///./"):
    DATABASE_URL = f"sqlite:///{(BASE_DIR / DATABASE_URL[len('sqlite:///./'):]).as_posix()}"
