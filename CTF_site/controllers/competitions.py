from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError

from models.alchemy_models import Available_competitions, Team
from models.schemes import SortCompOptions, Competition


def get_competitions_list(db, page, filter_type, sort, name):
    query = db.query(Available_competitions)

    # Apply filtering by type
    if filter_type:
        query = query.filter(Available_competitions.type == filter_type)

    # Apply name search
    if name:
        query = query.filter(Available_competitions.name.contains(name))

    # Apply sorting
    if sort:
        if sort == SortCompOptions.name_asc:
            query = query.order_by(asc(Available_competitions.name))
        elif sort == SortCompOptions.name_desc:
            query = query.order_by(desc(Available_competitions.name))
        elif sort == SortCompOptions.start_date_asc:
            query = query.order_by(asc(Available_competitions.start_date))
        elif sort == SortCompOptions.start_date_desc:
            query = query.order_by(desc(Available_competitions.start_date))

    # Pagination
    page_size = 10
    total_count = query.count()
    competitions_list = query.offset((page - 1) * page_size).limit(page_size).all()

    # Filter competitions that have not started yet
    now = datetime.now()
    upcoming_competitions = [comp for comp in competitions_list if comp.start_date > now]

    # Convert SQLAlchemy objects to Pydantic models
    competitions = [Competition.from_orm(comp) for comp in upcoming_competitions]

    result = {
        "competitions": competitions,
        "pagination": {
            "count": total_count,
            "current_page": page,
            "total_pages": (total_count // page_size) + (1 if total_count % page_size else 0)
        }
    }

    return result


def get_competition_teams(competition_id, db):
    # Check if the competition has not started yet
    competition = db.query(Available_competitions).filter(Available_competitions.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    if competition.start_date <= datetime.now():
        raise HTTPException(status_code=400, detail="Competition has already started")

    # Fetch teams from the database
    teams = db.query(Team).filter(Team.competition_id == competition_id).all()

    return {"teams": teams}


def join_or_create_team(current_user, team_id, newTeamName, db):
    if newTeamName:
        last_team = db.query(Team).order_by(Team.id.desc()).first()
        new_id = last_team.id + 1 if last_team else 1
        # Create a new team
        new_team = Team(id=new_id, name=newTeamName)
        db.add(new_team)
        db.commit()
        db.refresh(new_team)
        team_id = new_team.id
    else:
        # Join an existing team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        team_id = team.id

    try:
        # Add the user to the team
        team = db.query(Team).filter(Team.id == team_id).first()
        if team:
            team.users.append(current_user)
            db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already in team or other integrity error")

    return {"message": "User added to team successfully", "team_id": team_id}
