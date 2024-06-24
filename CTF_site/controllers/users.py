from datetime import date, timedelta

from fastapi import HTTPException, Query
from jose import jwt
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from controllers.tokens import get_current_active_user, login_for_access_token, create_access_token
from models.schemes import UserCreate as UserCreateScheme, UserEditProfile, UserProfile, Pagination, History, Profile, \
    Team, Task, CompetitionResponse
from models.schemes import Competition as CompetitionScheme
from models.alchemy_models import User as UserModel, Competition
from models.alchemy_models import Task as TaskModel, Team as TeamModel
from secure import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


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
    access_token = create_access_token(data={"sub": user.username},
                                       expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token}


def get_profile_with_competitions(current_user, db: Session, page: int = Query(1, ge=1),
                                  page_size: int = Query(10, ge=1, le=100)):
    total_competitions = db.query(func.count(Competition.id)).filter(Competition.user_id == current_user.id).scalar()

    competitions = db.query(Competition).filter(Competition.user_id == current_user.id) \
        .offset((page - 1) * page_size).limit(page_size).all()
    competition_list = [
        CompetitionScheme(
            id=comp.competition_id,
            date=comp.date,
            name=comp.name,
            type=comp.type,
            duration=comp.duration,
            points=comp.points,
            place=comp.place
        ) for comp in competitions
    ]

    pagination = Pagination(count=total_competitions, current_page=page)

    profile = Profile(
        username=current_user.username,
        email=current_user.email
    )

    history = History(
        competition=competition_list,
        pagination=pagination
    )

    return UserProfile(profile=profile, history=history)


def get_user_history(current_user, db: Session, page: int, page_size: int):
    total_competitions = db.query(func.count(Competition.id)).filter(Competition.user_id == current_user.id).scalar()

    competitions = db.query(Competition).filter(Competition.user_id == current_user.id) \
        .offset((page - 1) * page_size).limit(page_size).all()

    competition_list = [
        CompetitionScheme(
            id=comp.competition_id,
            date=comp.date,
            name=comp.name,
            type=comp.type,
            duration=comp.duration,
            points=comp.points,
            place=comp.place
        ) for comp in competitions
    ]
    pagination = Pagination(count=total_competitions, current_page=page)
    history = History(
        competition=competition_list,
        pagination=pagination
    )
    return history


def edit_profile(current_user, user_data: UserEditProfile, db: Session):
    try:
        current_user.username = user_data.username
        current_user.email = user_data.email
        current_user.hashed_password = pwd_context.hash(user_data.password)
        db.commit()

        # Re-issue the token
        new_token = jwt.encode({'sub': current_user.username}, SECRET_KEY, algorithm=ALGORITHM)
        return {"user": current_user, "token": new_token}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


def get_competition_details(competition_id, current_user, db):
    competition = db.query(Competition).filter(Competition.id == competition_id,
                                               Competition.user_id == current_user.id).first()
    print(competition)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found or not accessible by the user")

    tasks = db.query(TaskModel).filter(TaskModel.competition_id == competition.id).all()
    teams = db.query(TeamModel).filter(TeamModel.competition_id == competition.id).all()

    print(tasks)
    tasks_list = [
        Task(
            name=task.name,
            points=task.points,
            isResolved=task.is_resolved
        ) for task in tasks
    ]

    teams_list = [
        Team(
            place=team.place,
            name=team.name,
            points=team.points
        ) for team in teams
    ]

    competition_response = CompetitionResponse(
        nameOfCompetition=competition.name,
        date=competition.date,
        duration=competition.duration,
        placeOfYourSquad=competition.place_of_your_squad,
        pointsOfYourSquad=competition.points_of_your_squad,
        tasks=tasks_list,
        teams=teams_list
    )

    return competition_response
