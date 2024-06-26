from datetime import datetime
from typing import Optional

from fastapi import HTTPException, Depends
from sqlalchemy import text, asc, desc
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.alchemy_models import Task, Task, team_users, Team, team_tasks, competition_tasks
from models.schemes import TaskFull, CommentModel, TaskResponse, SortOptions


def get_tasks_info(page, sort, filter_type, name, db):
    query = db.query(Task).options(joinedload(Task.comments))

    # Применение фильтрации
    if filter_type:
        query = query.filter(Task.type == filter_type)

    # Применение поиска по имени
    if name:
        query = query.filter(Task.name.contains(name))

    # Применение сортировки
    if sort:
        if sort == 'name_asc':
            query = query.order_by(asc(Task.name))
        elif sort == 'name_desc':
            query = query.order_by(desc(Task.name))
        elif sort == 'difficulty_asc':
            query = query.order_by(asc(Task.difficulty))
        elif sort == 'difficulty_desc':
            query = query.order_by(desc(Task.difficulty))

    # Пагинация
    page_size = 10
    total_count = query.count()
    task_list = query.offset((page - 1) * page_size).limit(page_size).all()

    # Формирование списка задач с комментариями
    tasks = []
    for task in task_list:
        task_comments = [
            CommentModel(author=comment.author, content=comment.content, date=comment.date, task_id=comment.task_id) for
            comment in task.comments]

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
    task = db.query(Task).filter(Task.id == task_id).first()

    # Check if task exists
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return True if user_flag == task.flag else False


def check_if_flag_correct_in_comp(task_id, current_user, user_flag, db):
    # Query the task by task_id
    task = db.query(Task).filter(Task.id == task_id).first()

    # Check if task exists
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check if the flag is correct
    if user_flag == task.flag:
        # Find the user's team
        team = db.query(Team).join(team_users).filter(team_users.c.user_id == current_user.id).first()

        if not team:
            raise HTTPException(status_code=404, detail="User's team not found")

        # Check if the task is already resolved by the team
        resolved_task = db.query(team_tasks).filter(team_tasks.c.team_id == team.id,
                                                    team_tasks.c.task_id == task_id).first()
        if resolved_task:
            raise HTTPException(status_code=400, detail="Task already resolved by this team")

        # Get points for the task from the competition_tasks table
        task_points = db.query(competition_tasks.c.points).filter(
            competition_tasks.c.task_id == task_id,
            competition_tasks.c.competition_id == task.competitions[0].id  # Assuming task is part of one competition
        ).first()

        if not task_points:
            raise HTTPException(status_code=404, detail="Points for the task not found")

        points = task_points[0]

        # Add an entry to the team_tasks table with points
        db.execute(
            team_tasks.insert().values(team_id=team.id, task_id=task_id, resolved_at=datetime.utcnow())
        )

        # Update team's points
        team.points += points

        # Commit the transaction
        db.commit()

        return {"message": "Flag is correct and task marked as resolved for the team, points added"}
    else:
        return {"message": "Incorrect flag"}