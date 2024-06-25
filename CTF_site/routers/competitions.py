from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from controllers.competitions import get_competitions_list, get_competition_teams, join_or_create_team
from controllers.tokens import get_current_active_user
from database import get_db
from models.schemes import CompetitionsResponse, SortCompOptions, TeamsResponse, User

router = APIRouter()


@router.get("/upcoming-competitions", response_model=CompetitionsResponse)
async def get_upcoming_competitions(
        page: int = 1,
        sort: SortCompOptions = Query(None, description="Sort by: name_asc, name_desc, start_date_asc, start_date_desc"),
        type: Optional[str] = None,
        name: Optional[str] = None,
        db: Session = Depends(get_db)
):
    return get_competitions_list(db, page,type, sort, name)

@router.get("/{competition_id}/teams", response_model=TeamsResponse)
async def get_teams(competition_id: int,
    db: Session = Depends(get_db)):
    return get_competition_teams(competition_id, db)

@router.post("/teams/join_or_create")
async def join_or_create_team_route(
current_user: Annotated[User, Depends(get_current_active_user)],
    team_id: Optional[int] = None,
    new_team_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return join_or_create_team(current_user, team_id, new_team_name, db)