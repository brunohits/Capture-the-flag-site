from typing import Union

from fastapi import FastAPI

import models.user
from database import engine
from routers.users import router as user_router
from routers.tokens import router as token_router

models.user.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(
    router=user_router,
    prefix="/register")

app.include_router(
    router=token_router,
    prefix="/login"
)