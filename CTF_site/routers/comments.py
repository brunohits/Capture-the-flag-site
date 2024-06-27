from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette import status

from controllers.comments import add_comment, get_comments
from controllers.tokens import get_current_active_user
from database import get_db
from models.alchemy_models import Task
from models.schemes import User, CommentModel

router = APIRouter()


@router.post('', status_code=status.HTTP_200_OK)
def post_comment(task_id, content, current_user: Annotated[User, Depends(get_current_active_user)],
                 db: Session = Depends(get_db)):
    return add_comment(task_id, content, db, current_user)


@router.get('/get_task_comments')
def get_task_comments(task_id: UUID, db: Session = Depends(get_db)):
    return get_comments(task_id, db)
