from datetime import date

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    username: str
    password: str


class UserLogin(UserBase):
    password: str


class ShortUser(UserBase):
    id: int

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    username: str
    create_time: date

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
