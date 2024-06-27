from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from controllers.files import upload_file, get_file, UPLOAD_DIRECTORY, download_file
from database import get_db

router = APIRouter()


@router.post("/uploadfile/{task_id}")
async def upload_file_route(task_id: UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await upload_file(task_id, file, db)


@router.get("/getfile/{task_id}")
async def get_file_route(task_id: UUID, db: Session = Depends(get_db)):
    return await get_file(task_id, db)


@router.get("/downloadfile/")
def download_file_route(task_id: UUID, db: Session = Depends(get_db)):
    return download_file(task_id, db)
