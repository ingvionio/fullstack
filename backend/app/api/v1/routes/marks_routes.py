from typing import List, Optional

from fastapi import APIRouter, Depends, File, UploadFile, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_core import get_db
from app.schemas import MarkCreate, MarkRead
from app.services import create_mark, get_mark, list_marks, save_mark_photos, delete_mark
from app.services.mark_service import append_photos_to_mark

router = APIRouter(prefix="/marks", tags=["marks"])


@router.post("", response_model=MarkRead, status_code=status.HTTP_201_CREATED)
async def create_mark_endpoint(payload: MarkCreate, db: AsyncSession = Depends(get_db)) -> MarkRead:
    return await create_mark(db, payload)


@router.get("", response_model=List[MarkRead])
async def list_marks_endpoint(
    point_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> List[MarkRead]:
    return await list_marks(db, point_id=point_id)


@router.get("/{mark_id}", response_model=MarkRead)
async def get_mark_endpoint(mark_id: int, db: AsyncSession = Depends(get_db)) -> MarkRead:
    return await get_mark(db, mark_id)


@router.post("/{mark_id}/photos", response_model=MarkRead)
async def upload_mark_photos(
    mark_id: int,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
) -> MarkRead:
    urls = save_mark_photos(mark_id, files)
    return await append_photos_to_mark(db, mark_id, urls)


@router.delete("/{mark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mark_endpoint(mark_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await delete_mark(db, mark_id)
