from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from controllers.competitions import get_competitions_list, get_competition_teams, join_or_create_team, \
    create_competition, get_active_competition
from controllers.tokens import get_current_active_user
from database import get_db
from models.schemes import CompetitionsResponse, SortCompOptions, TeamsResponse, User, CompCreateScheme

router = APIRouter()


@router.get("/upcoming-competitions", response_model=CompetitionsResponse)
async def get_upcoming_competitions(
        page: int = 1,
        sort: SortCompOptions = Query(None,
                                      description="Sort by: name_asc, name_desc, start_date_asc, start_date_desc"),
        type: Optional[str] = None,
        name: Optional[str] = None,
        db: Session = Depends(get_db)
):
    return get_competitions_list(db, page, type, sort, name)


@router.get("/{competition_id}/teams", response_model=TeamsResponse)
async def get_teams(competition_id: int,
                    db: Session = Depends(get_db)):
    return get_competition_teams(competition_id, db)


@router.post("/teams/{competition_id}/join_or_create")
async def join_or_create_team_route(
        competition_id: int,
        current_user: Annotated[User, Depends(get_current_active_user)],
        team_id: Optional[int] = None,
        new_team_name: Optional[str] = None,
        enter_code: Optional[int] = None,
        db: Session = Depends(get_db)
):
    return join_or_create_team(competition_id, current_user, team_id, new_team_name,enter_code, db)


#
@router.post("/comp/create", status_code=201)
async def create_competition_route(
        current_user: Annotated[User, Depends(get_current_active_user)],
        comp_data: CompCreateScheme,
        db: Session = Depends(get_db)
):
    return create_competition(db, current_user, comp_data)


@router.get("/active_competition")
async def get_active_competition_route(current_user: Annotated[User, Depends(get_current_active_user)],
                                       db: Session = Depends(get_db)):
    return get_active_competition(current_user, db)
