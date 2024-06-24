from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers.tasks import get_tasks_info
from database import get_db
from models.schemes import TaskResponse
from secure import oauth2_scheme

router = APIRouter()


@router.get("", response_model=TaskResponse)
def get_tasks(page: int = 1, sort: Optional[str] = None, filter: Optional[str] = None, name: Optional[str] = None,
              db: Session = Depends(get_db)):
    return get_tasks_info(page, sort, filter, name, db)
