from base64 import b64encode
from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Boolean


class SortOptions(str, Enum):
    name_asc = "name_asc"
    name_desc = "name_desc"
    difficulty_asc = "points_asc"
    difficulty_desc = "points_desc"


class SortCompOptions(str, Enum):
    name_asc = "name_asc"
    name_desc = "name_desc"
    start_date_asc = "start_date_asc"
    start_date_desc = "start_date_desc"


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    username: str
    password: str


UserLogin = UserCreate


class UserEditProfile(UserBase):
    username: str


class ShortUser(UserBase):
    id: UUID

    class Config:
        from_attributes = True


class User(UserBase):
    id: UUID
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


class HistCompetition(BaseModel):
    id: UUID
    date: str
    name: str
    type: str
    end_date: datetime
    points: float
    place: int


class Competition(BaseModel):
    id: UUID
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    type: str
    is_private: bool
    can_create_team: bool

    class Config:
        orm_mode = True


class Pagination(BaseModel):
    count: int
    current_page: int


class History(BaseModel):
    competition: List[HistCompetition]
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


class CompetitionsResponse(BaseModel):
    competitions: List[Competition]
    pagination: Pagination


class CompetitionResponse(BaseModel):
    nameOfCompetition: str
    start_date: datetime
    end_date: datetime
    placeOfYourSquad: int
    pointsOfYourSquad: float
    tasks: List[Task]
    teams: List[Team]

    class Config:
        orm_mode = True


class CommentModel(BaseModel):
    author: str
    content: str
    date: datetime
    task_id: UUID


class TaskFull(BaseModel):
    id: UUID
    name: str
    type: str
    points: Optional[str] = ""
    description: Optional[str] = ""
    image: Optional[str] = ""
    text: Optional[str] = ""
    link: Optional[str] = ""
    file: bool = False
    comment: List[CommentModel]

    @classmethod
    def from_orm(cls, task):
        return cls(
            id=task.id,
            name=task.name,
            type=task.type,
            points=task.points,
            description=task.description,
            image=b64encode(task.image).decode('utf-8') if task.image else None,
            text=task.text,
            link=task.link,
            file=True if task.file else False,
            comment=[CommentModel.from_orm(comment) for comment in task.comments]
        )


class TaskResponse(BaseModel):
    tasks: List[TaskFull]
    pagination: Pagination


class TeamInComp(BaseModel):
    id: UUID
    name: str


class TeamsResponse(BaseModel):
    teams: List[TeamInComp]


class TaskWithPoints(BaseModel):
    task_id: UUID
    points: int


class CompCreateScheme(BaseModel):
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    type: str
    max_teams: int
    team_size: int
    owner_team_name: str
    is_private: bool = Field(default="false")
    enter_code: Optional[int] = Field(alias="enter_code")  # Assuming 'code' can be optional and is a string
    tasks: List[TaskWithPoints]  # List of task IDs
