from datetime import date, timedelta

from fastapi import HTTPException, Query
from jose import jwt
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from controllers.tokens import get_current_active_user, login_for_access_token, create_access_token
from models.schemes import UserCreate as UserCreateScheme, UserEditProfile, UserProfile, Pagination, History, Profile, \
    Task, Token
from models.schemes import HistCompetition as CompetitionScheme
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
        db.commit()

        # Re-issue the token
        new_token = jwt.encode({'sub': current_user.username}, SECRET_KEY, algorithm=ALGORITHM)
        return Token(access_token=new_token)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


def get_competition_details(competition_id, current_user, db):
    # Получаем соревнование по id
    competition = db.query(Competition).filter(Competition.id == competition_id).first()

    if not competition:
        return None

    # Получаем команды соревнования
    teams = db.query(TeamModel).filter(TeamModel.competition_id == competition.id).all()

    teams_sorted = sorted(teams, key=lambda team: team.points, reverse=True)
    for index, team in enumerate(teams_sorted):
        team.place = index + 1
    # Получаем задачи соревнования
    tasks = db.query(TaskModel).filter(TaskModel.competition_id == competition.id).all()

    # Находим команду текущего пользователя
    user_team = None
    for team in teams:
        if current_user.id in [user.id for user in team.users]:
            user_team = team
            break

    if not user_team:
        return None

    # Формируем результат
    result = {
        "nameOfCompetition": competition.name,
        "date": competition.date.isoformat(),
        "duration": competition.duration,
        "placeOfYourSquad": user_team.place,
        "pointsOfYourSquad": user_team.points,
        "tasks": [
            {
                "name": task.name,
                "points": task.points,
                "isResolved": task.is_resolved
            } for task in tasks
        ],
        "teams": [
            {
                "place": team.place,
                "name": team.name,
                "points": team.points
            } for team in teams[::-1]
        ]
    }

    return result
