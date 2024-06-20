from datetime import date

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from models.schemes import UserCreate as UserCreateScheme
from models.user import User as UserModel
from secure import pwd_context


def register(user_data: UserCreateScheme, db: Session):
    existing_user = db.scalar(select(UserModel).where(UserModel.email == user_data.email))
    if existing_user:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="User with this email already registered!"
        )
    user = UserModel(email=user_data.email)
    user.hashed_password = pwd_context.hash(user_data.password)
    user.create_time = date.today()
    user.username = user_data.username
    db.add(user)
    db.commit()
    return user
