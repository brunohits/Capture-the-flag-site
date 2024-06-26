from typing import Text, Optional, List

from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean, Float, Table, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Base = declarative_base()

team_users = Table('team_users', Base.metadata,
                   Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
                   Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
                   )


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    create_time = Column(Date)
    disabled = Column(Boolean, default=False)

    tokens = relationship("Token", back_populates="user")
    competitions = relationship("Competition", back_populates="owner")
    teams = relationship("Team", secondary=team_users, back_populates="users")


class Token(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True, autoincrement=True)
    access_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship("User", back_populates="tokens")


class Competition(Base):
    __tablename__ = 'competitions'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    name = Column(String)
    type = Column(String)
    duration = Column(String)
    points = Column(Float)
    place = Column(Integer)
    user_id = Column(Integer, ForeignKey('users.id'))

    tasks = relationship("Task", back_populates="competition")
    teams = relationship("Team", back_populates="competition")
    owner = relationship("User", back_populates="competitions")


class AvailableCompetitions(Base):
    __tablename__ = "available_competitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    start_date = Column(DateTime)
    duration = Column(Integer)
    type = Column(String)
    maxTeams = Column(Integer, default=10)
    teamSize = Column(Integer, default=5)
    owner_team_name = Column(String)
    is_private = Column(Boolean, default=False)
    can_create_team = Column(Boolean, default=True)
    enter_code = Column(Integer, nullable=True, unique=True)  # Assuming 'code' can be optional and is a string
    tasks = List[int]  # List of task IDs


class Team(Base):
    __tablename__ = 'teams'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    place = Column(Integer)
    name = Column(String)
    points = Column(Float)
    competition_id = Column(Integer, ForeignKey('competitions.id'), nullable=True)

    competition = relationship("Competition", back_populates="teams")
    users = relationship("User", secondary=team_users, back_populates="teams")


class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    points = Column(Float)
    is_resolved = Column(Boolean, default=False)
    competition_id = Column(Integer, ForeignKey('competitions.id'))

    competition = relationship("Competition", back_populates="tasks")


class TaskInfo(Base):
    __tablename__ = 'tasks_info'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    type = Column(String, index=True)
    flag = Column(String)
    difficulty = Column(String)
    description = Column(String)
    image = Column(String, nullable=True)
    text = Column(String, nullable=True)
    link = Column(String, nullable=True)
    file = Column(String, nullable=True)

    comments = relationship("Comment", back_populates="task")


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    author = Column(String)
    date = Column(DateTime)
    task_id = Column(Integer, ForeignKey('tasks_info.id'))
    task = relationship("TaskInfo", back_populates="comments")
