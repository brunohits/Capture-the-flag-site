from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

import models.alchemy_models
from database import engine
from routers.users import router as user_router
from routers.tokens import router as token_router
from routers.tasks import router as tasks_router
from routers.comments import router as comments_router
from routers.competitions import router as competitions_router
from routers.files import router as file_router
from routers.container import router as container_router

models.alchemy_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    # Add other allowed origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    router=user_router,
    prefix="/register")

app.include_router(
    router=token_router,
    prefix="/login"
)

app.include_router(
    router=tasks_router,
    prefix="/tasks"
)

app.include_router(
    router=comments_router,
    prefix="/comments"
)

app.include_router(
    router=competitions_router,
    prefix="/competitions"
)

app.include_router(
    router=file_router,
    prefix="/files"
)

app.include_router(
    router=container_router,
    prefix="/container"
)