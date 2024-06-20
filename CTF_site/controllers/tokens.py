import uuid
from datetime import date, datetime, timezone, timedelta

from fastapi import HTTPException
from jose import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED

from models.schemes import UserLogin as UserLoginScheme
from models.schemes import User as UserScheme
from models.user import User, Token
from secure import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db: Session, email: str):
    return db.scalar(select(User).where(User.email == email))


def authenticate(db: Session, user_data: UserLoginScheme):
    user = get_user(db, user_data.email)
    if not user:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=f"User with email {user_data.email} not found"
        )
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token({"sub": user.username}, expires_delta=access_token_expires)
    token: Token = Token(
        user_id=user.id,
        access_token=access_token,
        expires_at=datetime.now()
    )
    db.add(token)
    db.commit()
    return {"access_token": token.access_token}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
