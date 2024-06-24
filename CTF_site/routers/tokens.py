from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from controllers.tokens import authenticate_user, login_for_access_token
from database import get_db
from models import schemes
from models.schemes import Token

router = APIRouter()


@router.post("/token", response_model=Token, status_code=201)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return login_for_access_token(db, form_data)
