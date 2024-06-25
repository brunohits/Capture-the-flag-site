from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class SortOptions(str, Enum):
    name_asc = "name_asc"
    name_desc = "name_desc"
    difficulty_asc = "difficulty_asc"
    difficulty_desc = "difficulty_desc"


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


class HistCompetition(BaseModel):
    id: str
    date: date
    name: str
    type: str
    duration: str
    points: float
    place: int


class CompetitionBase(BaseModel):
    name: str
    description: str
    start_date: datetime = Field(alias="startDate")
    duration: int
    type: str
    is_closed: bool = Field(alias="isClosed")
    can_create_team: bool = Field(alias="canCreateTeam")


class CompetitionCreate(CompetitionBase):
    pass


class Competition(CompetitionBase):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        from_attributes = True


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


class CompetitionHistoryResponse(BaseModel):
    nameOfCompetition: str
    date: datetime
    duration: str
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
    task_id: int


class TaskFull(BaseModel):
    name: str
    type: str
    difficulty: str
    description: str
    id: int
    image: Optional[str] = Field(default="")
    text: Optional[str] = Field(default="")
    link: Optional[str] = Field(default="")
    file: Optional[str] = Field(default="")
    comment: List[CommentModel] = Field(default_factory=list)


class TaskResponse(BaseModel):
    tasks: List[TaskFull]
    pagination: Pagination


class TeamInComp(BaseModel):
    id: int
    name: str


class TeamsResponse(BaseModel):
    teams: List[TeamInComp]

