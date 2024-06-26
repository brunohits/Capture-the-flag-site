from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers.container import up_site_container
from database import get_db

router = APIRouter()


@router.post("/up_site_container/{task_id}")
def up_site_container_route(task_id: UUID, db: Session = Depends(get_db)):
    return up_site_container(task_id, db)
