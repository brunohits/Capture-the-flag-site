import socket

import docker
from fastapi import HTTPException

from models.alchemy_models import Task

client = docker.from_env()


def up_site_container(task_id, db):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        # Создаем и запускаем контейнер
        container = client.containers.run(
            "nginx-container",  # Замените на имя вашего образа
            detach=True,
            ports={'80/tcp': 8080}  # Публикуем порт 80 на 8080
        )

        # Получаем IP-адрес хоста
        host_ip = socket.gethostbyname(socket.gethostname())

        # Обновляем task.link
        task.link = f"http://{host_ip}:8080"
        db.commit()

        return {"message": "Container started successfully", "ip_address": task.link}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))