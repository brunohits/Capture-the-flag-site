from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import asc, desc, and_, func, text
from sqlalchemy.exc import IntegrityError

from models.alchemy_models import Competition, Team, Task, Task, competition_tasks, team_users
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
            "end_date": comp.end_date,
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


def join_or_create_team(competition_id, current_user, team_id, new_team_name, enter_code, db):
    # Query the competition
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    print(enter_code, competition.enter_code, enter_code == competition.enter_code)
    # Check if competition is private and validate enter_code
    if competition.is_private:
        if enter_code is None or enter_code != competition.enter_code:
            raise HTTPException(status_code=403, detail="Invalid enter code for private competition")

    if new_team_name:
        new_team = Team(id=uuid4(), name=new_team_name, competition_id=competition_id)
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
    # Create a new team




    # Create a new competition instance
    new_competition = Competition(
        name=comp_body.name,
        description=comp_body.description,
        start_date=comp_body.start_date,
        end_date=comp_body.end_date,
        type=comp_body.type,
        maxTeams=comp_body.max_teams,
        teamSize=comp_body.team_size,
        owner_team_name=comp_body.owner_team_name,
        is_private=comp_body.is_private,
        enter_code=comp_body.enter_code,
        owner_id=current_user.id  # Assuming the owner is the current user
    )
    db.add(new_competition)
    db.commit()
    db.refresh(new_competition)  # Refresh to get the generated ID


    new_team = Team(name=comp_body.owner_team_name, competition_id=new_competition.id)  # competition_id will be set later
    db.add(new_team)
    db.commit()
    db.refresh(new_team)  # Refresh to get the generated ID
    # Add the competition to the session
    # Add current user to the new team
    db.execute(
        team_users.insert().values(team_id=new_team.id, user_id=current_user.id)
    )
    db.commit()

    # Update the competition_id of the newly created team
    new_team.competition_id = new_competition.id
    db.commit()

    # Link selected tasks to the new competition using the association table
    for task_with_points in comp_body.tasks:
        task = db.query(Task).filter(Task.id == task_with_points.task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_with_points.task_id} not found")

        # Insert the task with points into the competition_tasks table
        db.execute(
            competition_tasks.insert().values(
                competition_id=new_competition.id,
                task_id=task.id,
                points=task_with_points.points
            )
        )

    # Commit again to save the tasks linked to the competition
    db.commit()

    return {"message": "Competition successfully created with associated tasks and points"}


def get_active_competition(current_user, db):
    # Get the current time
    now = datetime.now()

    # Find all teams where current_user is a member
    teams = db.query(Team).join(team_users).filter(team_users.c.user_id == current_user.id).all()
    if not teams:
        raise HTTPException(status_code=404, detail="User is not part of any team")

    # Iterate through each team and find the ongoing competition
    for team in teams:
        competition_id = team.competition_id
        if not competition_id:
            continue

        # Find the ongoing competition for this team
        competition = db.query(Competition).filter(
            and_(
                Competition.id == competition_id,
                Competition.start_date <= now,
                Competition.end_date >= now
            )
        ).first()
        if competition:
            # Fetch all teams participating in the competition
            teams_in_competition = db.query(Team).filter(Team.competition_id == competition.id).all()
            teams_list = [{"name": t.name, "score": t.points} for t in teams_in_competition]

            # Fetch tasks associated with the competition
            tasks_with_details = db.query(Task, competition_tasks.c.points).join(
                competition_tasks, Task.id == competition_tasks.c.task_id).filter(
                competition_tasks.c.competition_id == competition.id).all()
            tasks_list = [
                {
                    "id": task.id,
                    "name": task.name,
                    "type": task.type,
                    "points": task.points,
                    "description": task.description,
                    "image": task.image,
                    "text": task.text,
                    "link": task.link,
                    "file": task.file
                } for task, points in tasks_with_details
            ]

            # Create response
            response = {
                "name": competition.name,
                "description": competition.description,
                "startDate": competition.start_date.isoformat(),
                "endDate": competition.end_date.isoformat(),
                "team": {
                    "id": team.id,
                    "name": team.name,
                    "score": team.points
                },
                "teams": teams_list,
                "tasks": tasks_list
            }

            return response

    raise HTTPException(status_code=400, detail="No ongoing competition")
