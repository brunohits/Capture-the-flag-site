from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from starlette import status
from starlette.responses import Response

from models.alchemy_models import Task, Comment
from models.schemes import CommentModel


def add_comment(task_id, content, db, current_user):
    # Query the task by task_id
    task = db.query(Task).filter(Task.id == task_id).first()

    # Check if task exists
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Create a new comment
    new_comment = Comment(
        content=content,
        date=datetime.now(),
        author=current_user.username,  # Set the owner
        task_id=task_id  # Assuming Comment model has a task_id field to establish the relationship
    )

    # Add the comment to the database
    try:
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add comment")

    # Return the response
    return Response(status_code=status.HTTP_200_OK)


def get_comments(task_id, db):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Query for comments associated with the task_id
    comments = db.query(Comment).filter(Comment.task_id == task_id).all()

    # Convert comments to a list of dictionaries or a similar structure for serialization
    # This step is optional and can be adjusted based on how you wish to use the data.
    result = [
        {
            "id": comment.id,
            "author": comment.author,
            "content": comment.content,
            "date": comment.date
        }
        for comment in comments
    ]

    return result
