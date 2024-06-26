from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError

from models.alchemy_models import Competition, Team, Task, Task
from models.schemes import SortCompOptions, CompCreateScheme


def get_competitions_list(db, page, filter_type, sort, name):
    query = db.query(Competition)

    # Apply filtering by type
    if filter_type:
        query = query.filter(Competition.type == filter_type)

    # Apply name search
    if name:
        query = query.filter(Competition.name.contains(name))

    # Apply sorting
    if sort:
        if sort == SortCompOptions.name_asc:
            query = query.order_by(asc(Competition.name))
        elif sort == SortCompOptions.name_desc:
            query = query.order_by(desc(Competition.name))
        elif sort == SortCompOptions.start_date_asc:
            query = query.order_by(asc(Competition.start_date))
        elif sort == SortCompOptions.start_date_desc:
            query = query.order_by(desc(Competition.start_date))

    # Pagination
    page_size = 10
    total_count = query.count()
    competitions_list = query.offset((page - 1) * page_size).limit(page_size).all()

    # Filter competitions that have not started yet
    now = datetime.now()
    upcoming_competitions = [comp for comp in competitions_list if comp.start_date > now]

    # Create a list of competitions in dictionary format
    competitions = []
    for comp in upcoming_competitions:
        competitions.append({
            "id": comp.id,
            "name": comp.name,
            "type": comp.type,
            "description": comp.description,
            "start_date": comp.start_date.isoformat(),  # Ensure datetime is in ISO format
            "duration": comp.duration,
            "is_private": comp.is_private,
            "can_create_team": comp.can_create_team
        })

    result = {
        "competitions": competitions,
        "pagination": {
            "count": total_count,
            "current_page": page,
            "total_pages": (total_count // page_size) + (1 if total_count % page_size != 0 else 0)
        }
    }

    return result


def get_competition_teams(competition_id, db):
    # Check if the competition has not started yet
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    if competition.start_date <= datetime.now():
        raise HTTPException(status_code=400, detail="Competition has already started")

    # Fetch teams from the database
    teams = db.query(Team).filter(Team.competition_id == competition_id).all()

    return {"teams": teams}


def join_or_create_team(competition_id, current_user, team_id, newTeamName, db):
    if newTeamName:
        last_team = db.query(Team).order_by(Team.id.desc()).first()
        new_id = last_team.id + 1 if last_team else 1
        # Create a new team
        new_team = Team(id=new_id, name=newTeamName, competition_id=competition_id)
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


def create_competition(db, current_user, comp_body):
    # Validate that the specified team exists
    team = db.query(Team).filter(Team.name == comp_body.owner_team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Specified team does not exist")

    # Check if the current user is part of this team
    if current_user not in team.users:
        raise HTTPException(status_code=403, detail="User is not part of the specified team")

    # Create a new competition instance
    new_competition = Competition(
        name=comp_body.name,
        description=comp_body.description,
        start_date=comp_body.start_date,
        duration=comp_body.duration,
        type=comp_body.type,
        maxTeams=comp_body.max_teams,
        teamSize=comp_body.team_size,
        owner_team_name=comp_body.owner_team_name,
        is_private=comp_body.is_private,
        enter_code=comp_body.enter_code,
        owner_id=current_user.id  # Assuming the owner is the current user
    )

    # Add the competition to the session
    db.add(new_competition)
    db.commit()
    db.refresh(new_competition)  # Refresh to get the generated ID

    # Link selected tasks to the new competition using the association table
    task_infos = db.query(Task).filter(Task.id.in_(comp_body.tasks)).all()
    if len(task_infos) != len(comp_body.tasks):
        raise HTTPException(status_code=404, detail="One or more tasks not found")

    new_competition.tasks = task_infos  # Link tasks to competition through the association table

    # Commit again to save the tasks linked to the competition
    db.commit()

    return {"message": "Competition successfully created with associated tasks"}
