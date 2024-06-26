from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from controllers.tasks import get_tasks_info, check_if_flag_correct, check_if_flag_correct_in_comp
from controllers.tokens import get_current_active_user
from database import get_db
from models.schemes import TaskResponse, SortOptions, User
from secure import oauth2_scheme

router = APIRouter()


@router.get("", response_model=TaskResponse)
def get_tasks(
        page: int = Query(1, alias="page"),
        sort: SortOptions = Query(None, description="Sort by: name_asc, name_desc, difficulty_asc, difficulty_desc"),
        filter_type: Optional[str] = Query(None),
        name: Optional[str] = Query(None, alias="name"),
        db: Session = Depends(get_db)):
    return get_tasks_info(page, sort, filter_type, name, db)


@router.get("/check_flag")
def check_flag(task_id, user_flag, db: Session = Depends(get_db)):
    return check_if_flag_correct(task_id, user_flag, db)


@router.get("/check_flag_in_competition")
def check_flag_in_comp(current_user: Annotated[User, Depends(get_current_active_user)], task_id, user_flag,
                       db: Session = Depends(get_db)):
    return check_if_flag_correct_in_comp(task_id, current_user, user_flag, db)
