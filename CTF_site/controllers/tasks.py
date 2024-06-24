from typing import Optional

from fastapi import HTTPException, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models.alchemy_models import TaskInfo
from models.schemes import TaskFull


def get_tasks_info(page: int = 1, sort: Optional[str] = None, filter: Optional[str] = None, name: Optional[str] = None, db: Session = Depends(get_db)):

    query = db.query(TaskInfo)

    if name:
        query = query.filter(TaskInfo.name.contains(name))
    if filter:
        filter_query = text(filter)
        query = query.filter(filter_query)
    if sort:
        query = query.order_by(sort)

    total_tasks = query.count()
    tasks = query.offset((page - 1) * 10).limit(10).all()

    tasks_out = []
    for task in tasks:
        task_dict = task.__dict__
        task_dict['comments'] = [{'name': comment.name, 'date': comment.date} for comment in task.comments]
        tasks_out.append(TaskFull(**task_dict))

    return {
        "examples": tasks_out,
        "pagination": {
            "count": total_tasks,
            "current_page": page
        }
    }