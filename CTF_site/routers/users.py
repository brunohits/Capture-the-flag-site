from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers.users import register
from database import get_db
from models import schemes

router = APIRouter()


@router.post("", response_model=schemes.ShortUser, status_code=201)
def register_user(user_data: schemes.UserCreate, db: Session = Depends(get_db)):
    return register(user_data, db)
