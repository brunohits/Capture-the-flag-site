$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    fetchCompetitionDetails();

    function fetchCompetitionDetails() {
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "GET",
            url: `https://mis-api.kreosoft.space/api/competitions/${competitionId}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderCompetitionDetails(data);
            },
            error: function(error) {
                alert('Ошибка получения информации о соревновании: ' + error.responseText);
                window.location.href = '/competitions';
            }
        });
        */

        // Тестовые данные
        const testCompetitionData = {
            name: "Тестовое соревнование",
            description: "Описание тестового соревнования",
            startDate: new Date(),
            duration: 24,
            team: {
                name: "Тестовая команда",
                score: 100
            },
            teams: [
                { name: "Команда 1", score: 150 },
                { name: "Команда 2", score: 100 },
                { name: "Команда 3", score: 50 }
            ],
            tasks: [
                {
                    id: 1,
                    name: "Задача 1",
                    type: "Тип 1",
                    difficulty: "Легкая",
                    description: "Описание задачи 1",
                    media: [
                        { url: "http://example.com/file1.txt", name: "file1.txt" }
                    ]
                },
                {
                    id: 2,
                    name: "Задача 2",
                    type: "Тип 2",
                    difficulty: "Средняя",
                    description: "Описание задачи 2",
                    media: []
                }
            ]
        };
        renderCompetitionDetails(testCompetitionData);
    }

    function renderCompetitionDetails(competition) {
        const competitionDetails = $('#competitionDetails');
        const teamName = competition.team ? competition.team.name : 'Вы не присоединены к команде';
        const teamScore = competition.team ? competition.team.score : 'Нет данных';
        
        let teamsTable = '';
        competition.teams.forEach((team, index) => {
            teamsTable += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${team.name}</td>
                    <td>${team.score}</td>
                </tr>
            `;
        });

        let tasksList = '';
        competition.tasks.forEach((task, index) => {
            const uniqueId = `task-${index}-${Date.now()}`;

            let mediaFiles = '';
            if (task.media && task.media.length > 0) {
                mediaFiles += `<div class="h5 mt-3">Медиафайлы:</div>`;
                task.media.forEach(media => {
                    mediaFiles += `
                        <div>
                            <a href="${media.url}" target="_blank">${media.name}</a>
                        </div>
                    `;
                });
            }

            tasksList += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${uniqueId}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${uniqueId}" aria-expanded="true" aria-controls="collapse${uniqueId}">
                            <div class="col text-center">${task.name}</div>
                            <div class="col text-center">${task.type}</div>
                            <div class="col text-center">${task.difficulty}</div>
                        </button>
                    </h2>
                    <div id="collapse${uniqueId}" class="accordion-collapse collapse" aria-labelledby="heading${uniqueId}" data-bs-parent="#accordion1">
                        <div class="accordion-body">
                            <div class="h5">Описание</div>
                            <p>${task.description}</p>
                            ${mediaFiles}
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="flag${uniqueId}" placeholder="Введите флаг">
                                <button class="btn btn-primary" onclick="checkFlag('${task.id}', '${uniqueId}', '${competition.team.id}')">Проверить</button>
                            </div>
                            <div id="flag-result${uniqueId}"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        const html = `
            <h3>${competition.name}</h3>
            <p>${competition.description}</p>
            <p>Дата начала: ${new Date(competition.startDate).toLocaleString()}</p>
            <p>Длительность: ${competition.duration} часов</p>
            <p>Название вашей команды: ${teamName}</p>
            <p>Баллы вашей команды: ${teamScore}</p>

            <h4>Таблица команд:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Название команды</th>
                        <th>Баллы</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamsTable}
                </tbody>
            </table>

            <h4>Список задач:</h4>
            <div id="accordion1">
                ${tasksList}
            </div>
        `;
        competitionDetails.html(html);
    }
});

function checkFlag(taskId, uniqueId, teamId) {
    const flagInput = $(`#flag${uniqueId}`).val();
    
    // Реальный AJAX-запрос закомментирован
    /*
    $.ajax({
        method: "POST",
        url: `https://mis-api.kreosoft.space/api/tasks/${taskId}/submit`,
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        data: {
            flag: flagInput,
            teamId: teamId
        },
        success: function(response) {
            $(`#flag-result${uniqueId}`).html(`<div class="alert alert-success">${response.message}</div>`);
        },
        error: function(error) {
            $(`#flag-result${uniqueId}`).html(`<div class="alert alert-danger">${error.responseJSON.message}</div>`);
        }
    });
    */

    // Тестовые данные для эмуляции ответа сервера
    const testFlagResponse = {
        message: "Флаг принят"
    };

    if (flagInput === "testflag") {
        $(`#flag-result${uniqueId}`).html(`<div class="alert alert-success">${testFlagResponse.message}</div>`);
    } else {
        $(`#flag-result${uniqueId}`).html(`<div class="alert alert-danger">Неверный флаг</div>`);
    }
}
