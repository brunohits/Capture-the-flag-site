from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


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
    competition_id = Column(String, unique=True, index=True)
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



class Team(Base):
    __tablename__ = 'teams'

    id = Column(Integer, primary_key=True, index=True)
    place = Column(Integer)
    name = Column(String)
    points = Column(Float)
    competition_id = Column(Integer, ForeignKey('competitions.id'))

    competition = relationship("Competition", back_populates="teams")


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

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    difficulty = Column(String)
    description = Column(String)
    image = Column(String)
    text = Column(String)
    link = Column(String)
    file = Column(String)
    comments = relationship("Comment", back_populates="task")


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(DateTime)
    task_id = Column(Integer, ForeignKey('tasks_info.id'))
    task = relationship("TaskInfo", back_populates="comments")