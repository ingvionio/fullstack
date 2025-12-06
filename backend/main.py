from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.routes import api_router
from app.core.config import settings
from app.core.db_core import SessionLocal, init_db
from app.services.achievement_service import initialize_default_achievements


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    await init_db()

    # Initialize default achievements
    async with SessionLocal() as db:
        await initialize_default_achievements(db)

    yield

    # Shutdown (if needed)
    pass


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(api_router)
settings.media_root.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_root, check_dir=True), name="media")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Health Map API", "version": "v1"}


def run() -> None:
    """Entry point for running via `python main.py`."""

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    run()
