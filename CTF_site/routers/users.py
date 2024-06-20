from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers.tokens import get_current_active_user
from controllers.users import register
from database import get_db
from models import schemes
from models.schemes import User

router = APIRouter()


@router.post("", response_model=schemes.ShortUser, status_code=201)
def register_user(user_data: schemes.UserCreate, db: Session = Depends(get_db)):
    return register(user_data, db)


@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user
