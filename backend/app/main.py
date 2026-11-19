from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_ORIGIN
from .db import SessionLocal, init_db
from .routers import admin, auth, content, contest, writing
from .seed import seed


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Multilevel C1 platforma", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in FRONTEND_ORIGIN.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, content, writing, contest, admin):
    app.include_router(r.router)


@app.get("/api/health")
def health():
    return {"ok": True}
