import os
import time
from pathlib import Path
from typing import Iterable

from fastapi import UploadFile

from app.core.config import settings


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _unique_name(original: str) -> str:
    ts = int(time.time() * 1000)
    name = os.path.basename(original)
    return f"{ts}_{name}"


def save_user_avatar(user_id: int, file: UploadFile) -> str:
    """Save avatar file for a user and return public URL path."""

    base_dir = settings.media_root / "avatars" / f"user_{user_id}"
    _ensure_dir(base_dir)
    filename = _unique_name(file.filename or "avatar")
    dest = base_dir / filename
    content = file.file.read()
    dest.write_bytes(content)
    return f"/media/avatars/user_{user_id}/{filename}"


def save_mark_photos(mark_id: int, files: Iterable[UploadFile]) -> list[str]:
    """Save a collection of mark photos and return their URLs."""

    base_dir = settings.media_root / "marks" / f"mark_{mark_id}"
    _ensure_dir(base_dir)
    urls: list[str] = []
    for file in files:
        filename = _unique_name(file.filename or "photo")
        dest = base_dir / filename
        content = file.file.read()
        dest.write_bytes(content)
        urls.append(f"/media/marks/mark_{mark_id}/{filename}")
    return urls
