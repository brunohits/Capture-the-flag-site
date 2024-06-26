from typing import Optional

from fastapi import HTTPException, Depends
from sqlalchemy import text, asc, desc
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.alchemy_models import TaskInfo, Task
from models.schemes import TaskFull, CommentModel, TaskResponse, SortOptions


def get_tasks_info(page, sort, filter_type, name, db):
    query = db.query(TaskInfo).options(joinedload(TaskInfo.comments))

    # Применение фильтрации
    if filter_type:
        query = query.filter(TaskInfo.type == filter_type)

    # Применение поиска по имени
    if name:
        query = query.filter(TaskInfo.name.contains(name))

    # Применение сортировки
    if sort:
        if sort == 'name_asc':
            query = query.order_by(asc(TaskInfo.name))
        elif sort == 'name_desc':
            query = query.order_by(desc(TaskInfo.name))
        elif sort == 'difficulty_asc':
            query = query.order_by(asc(TaskInfo.difficulty))
        elif sort == 'difficulty_desc':
            query = query.order_by(desc(TaskInfo.difficulty))

    # Пагинация
    page_size = 10
    total_count = query.count()
    task_list = query.offset((page - 1) * page_size).limit(page_size).all()

    # Формирование списка задач с комментариями
    tasks = []
    for task in task_list:
        task_comments = [CommentModel(author=comment.author, content=comment.content, date=comment.date, task_id=comment.task_id) for comment in task.comments]

        tasks.append(TaskFull(
            name=task.name,
            type=task.type,
            difficulty=task.difficulty,
            description=task.description,
            id=task.id,
            image=task.image or "",
            text=task.text or "",
            link=task.link or "",
            file=task.file or "",
            comment=task_comments
        ))

    pagination = {
        "count": total_count,
        "current_page": page
    }

    return TaskResponse(tasks=tasks, pagination=pagination)


def check_if_flag_correct(task_id, user_flag, db):
    # Query the task by task_id
    task = db.query(TaskInfo).filter(TaskInfo.id == task_id).first()

    # Check if task exists
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return True if user_flag == task.flag else False
