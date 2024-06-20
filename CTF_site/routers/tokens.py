from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers.tokens import authenticate
from database import get_db
from models import schemes

router = APIRouter()


@router.post("", response_model=schemes.Token, status_code=201)
def login(user_data: schemes.UserLogin, db: Session = Depends(get_db)):
    return authenticate(db, user_data)
