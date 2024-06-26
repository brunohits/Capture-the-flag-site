from datetime import date, timedelta

from fastapi import HTTPException, Query
from jose import jwt
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from controllers.tokens import get_current_active_user, login_for_access_token, create_access_token
from models.schemes import UserCreate as UserCreateScheme, UserEditProfile, UserProfile, Pagination, History, Profile, \
    Token
from models.schemes import HistCompetition as CompetitionScheme
from models.alchemy_models import User as UserModel, Competition, Team, Task, competition_tasks, team_tasks, team_users

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
    # Query to find the total number of competitions for pagination
    total_competitions = db.query(func.count(Competition.id)).join(Team).join(team_users).filter(
        team_users.c.user_id == current_user.id,
        Team.competition_id == Competition.id
    ).scalar()

    # Query to get the competitions and associated team points
    competitions_with_points = db.query(
        Competition,
        Team.points.label('team_points'),
        Team.competition_id.label('comp_id')
    ).join(Team).join(team_users).filter(
        team_users.c.user_id == current_user.id,
        Team.competition_id == Competition.id
    ).offset((page - 1) * page_size).limit(page_size).all()

    if not competitions_with_points:
        raise HTTPException(status_code=404, detail="No competitions found for the user")

    competition_list = []
    for comp, team_points, comp_id in competitions_with_points:
        # Get all teams in the current competition to calculate the place
        teams_in_competition = db.query(Team).filter(Team.competition_id == comp_id).order_by(Team.points.desc()).all()

        # Find the place of the user's team in the competition
        for index, team in enumerate(teams_in_competition):
            if team.users and current_user.id in [user.id for user in team.users]:
                place = index + 1
                break
        else:
            place = None

        competition_list.append(CompetitionScheme(
            id=comp.id,
            date=comp.start_date.isoformat(),
            name=comp.name,
            type=comp.type,
            duration=comp.duration,
            points=team_points,  # Points from the teams table
            place=place  # Calculated place
        ))

    # Create Pagination object
    pagination = Pagination(
        count=total_competitions,
        current_page=page,
        total_pages=(total_competitions // page_size) + (1 if total_competitions % page_size != 0 else 0)
    )

    # Create History object
    history = History(
        competition=competition_list,  # Corrected the field name to match the Pydantic model
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
    # Get competition by id
    competition = db.query(Competition).filter(Competition.id == competition_id).first()

    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")

    # Get teams for the competition
    teams = db.query(Team).filter(Team.competition_id == competition.id).all()

    # Sort teams by points and update their place
    teams_sorted = sorted(teams, key=lambda team: team.points, reverse=True)
    for index, team in enumerate(teams_sorted):
        team.place = index + 1

    # Get tasks for the competition by joining the competition_tasks association table
    tasks = db.query(Task, competition_tasks.c.points).join(
        competition_tasks, Task.id == competition_tasks.c.task_id).filter(
        competition_tasks.c.competition_id == competition.id).all()

    # Find the team of the current user
    user_team = None
    for team in teams_sorted:
        if current_user.id in [user.id for user in team.users]:
            user_team = team
            break

    if not user_team:
        raise HTTPException(status_code=403, detail="User is not part of any team in this competition")

    # Get resolved task ids for the user's team
    resolved_task_ids = db.query(team_tasks.c.task_id).filter(team_tasks.c.team_id == user_team.id).all()
    resolved_task_ids = {task_id for (task_id,) in resolved_task_ids}

    # Form the result
    result = {
        "nameOfCompetition": competition.name,
        "start_date": competition.start_date.isoformat(),
        "duration": competition.duration,
        "placeOfYourSquad": user_team.place,
        "pointsOfYourSquad": user_team.points,
        "tasks": [
            {
                "name": task.name,
                "points": points,
                "isResolved": task.id in resolved_task_ids
            } for task, points in tasks
        ],
        "teams": [
            {
                "place": team.place,
                "name": team.name,
                "points": team.points
            } for team in teams_sorted
        ]
    }

    return result