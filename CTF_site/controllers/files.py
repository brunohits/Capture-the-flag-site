import os
from base64 import b64encode
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import aiofiles
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse, Response

from models.alchemy_models import Task

UPLOAD_DIRECTORY = "uploads/"

# Создаем директорию, если она не существует
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


async def upload_file(task_id, file, db):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    content = await file.read()

    # Определяем тип файла и обновляем соответствующее поле
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension in ["jpg", "jpeg", "png", "gif"]:
        task.image = content
    elif file_extension in ["txt"]:
        task.text = content
    elif file_extension in ["exe", "bin"]:
        if len(content) > 5 * 1024 * 1024:  # Если файл больше 5Мб
            file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
            async with aiofiles.open(file_location, 'wb') as out_file:
                await out_file.write(content)
            task.file = file_location
        else:
            task.file = content
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Сохраняем изменения в базе данных
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")

    return JSONResponse(content={"info": f"file '{file.filename}' uploaded and task updated"}, status_code=200)


async def get_file(task_id, db):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Determine which field contains the file data
    file_data = None
    content_type = "application/octet-stream"

    if task.image:
        file_data = task.image
        content_type = "image/png"  # You can change this depending on your use case
    elif task.text:
        file_data = task.text
        content_type = "text/plain"
    elif task.file:
        file_data = task.file
        content_type = "application/octet-stream"

    if not file_data:
        raise HTTPException(status_code=404, detail="File not found")

    return Response(content=file_data, media_type=content_type)


def download_file(task_id,db):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task.file:
        raise HTTPException(status_code=404, detail="File not found for this task")

    file_path = task.file

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path), media_type='application/octet-stream')