from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from controllers.tokens import get_current_active_user
from controllers.users import register, edit_profile, get_profile_with_competitions, get_user_history, \
    get_competition_details
from database import get_db
from models import schemes
from models.schemes import User, UserProfile, History, Token, CompetitionHistoryResponse

router = APIRouter()


@router.post("", response_model=schemes.Token, status_code=201)
def register_user(user_data: schemes.UserCreate, db: Session = Depends(get_db)):
    return register(user_data, db)


@router.get("/users/me/profile", response_model=UserProfile)
async def get_profile(current_user: Annotated[User, Depends(get_current_active_user)], db: Session = Depends(get_db),
                      page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    return get_profile_with_competitions(current_user, db=db, page=page, page_size=page_size)


@router.get("/users/me/history", response_model=History)
async def get_history(current_user: Annotated[User, Depends(get_current_active_user)], db: Session = Depends(get_db),
                      page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    return get_user_history(current_user, db=db, page=page, page_size=page_size)


@router.get("/competitions/{competition_id}", response_model=CompetitionHistoryResponse)
async def get_competition(
        competition_id: int,
        current_user: Annotated[User, Depends(get_current_active_user)],
        db: Session = Depends(get_db)
):
    return get_competition_details(competition_id, current_user, db=db)


@router.get("/users/me/username")
async def get_current_username(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user.username


@router.put("/users/me/editProfile", response_model=Token)
async def edit_profile_me(current_user: Annotated[User, Depends(get_current_active_user)],
                          user_data: schemes.UserEditProfile, db: Session = Depends(get_db)):
    return edit_profile(current_user, user_data, db)

