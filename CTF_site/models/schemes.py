from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    username: str
    password: str


UserLogin = UserCreate
UserEditProfile = UserCreate


class ShortUser(UserBase):
    id: int

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    username: str
    create_time: date
    disabled: bool

    class Config:
        from_attributes = True


class UserInDB(User):
    password: str


class Token(BaseModel):
    access_token: str


class TokenData(BaseModel):
    username: str | None = None


class Competition(BaseModel):
    id: str
    date: date
    name: str
    type: str
    duration: str
    points: float
    place: int


class Pagination(BaseModel):
    count: int
    current_page: int


class History(BaseModel):
    competition: List[Competition]
    pagination: Pagination


class Profile(BaseModel):
    username: str
    email: EmailStr


class UserProfile(BaseModel):
    profile: Profile
    history: History


class Task(BaseModel):
    name: str
    points: float
    isResolved: bool


class Team(BaseModel):
    place: int
    name: str
    points: float


class CompetitionResponse(BaseModel):
    nameOfCompetition: str
    date: datetime
    duration: str
    placeOfYourSquad: int
    pointsOfYourSquad: float
    tasks: List[Task]
    teams: List[Team]

    class Config:
        orm_mode = True


class TaskFull(BaseModel):
    id: int
    name: str
    type: str
    difficulty: str
    description: str
    image: Optional[str]
    text: Optional[str]
    link: Optional[str]
    file: Optional[str]
    comments: List[dict]


class TaskResponse(BaseModel):
    examples: List[TaskFull]
    pagination: Pagination
