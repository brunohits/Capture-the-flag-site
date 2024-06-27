$(document).ready(function() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        window.location.href = '/login';
        return;
    }

    fetchCompetitionDetails();

    function fetchCompetitionDetails() {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/competitions/active_competition`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                console.log(data);
                renderCompetitionDetails(data);
            },
            error: function(error) {
                alert('Ошибка получения информации о соревновании: ' + error.responseText);
            }
        });
    }

    function renderMedia(example) {
        if (example.image) {
            return `<img src="data:image/jpeg;base64,${example.image}" class="img-fluid">`;
        } else if (example.link) {
            return `<a href="${example.link}" target="_blank">Перейти по ссылке</a>`;
        } else if (example.text) {
            return `<p>${example.text}</p>`;
        }
        return '';
    }

    function renderFileButton(example) {
        if (example.file) {
            return `<button class="btn btn-primary" onclick="downloadFile('${example.id}')">Скачать файл</button>`;
        }
        return '';
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
            tasksList += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                            <div class="col text-center">${task.name}</div>
                            <div class="col text-center">${task.type}</div>
                            <div class="col text-center">${task.points}</div>
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordion1">
                        <div class="accordion-body">
                            <div class="h5">Описание</div>
                            <div style="white-space: normal; word-wrap: break-word;">${task.description}</div>
                            ${renderMedia(task)}
                            ${renderFileButton(task)}
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="flag${index}" placeholder="Введите флаг">
                                <button class="btn btn-primary" onclick="checkFlag('${task.id}', '${index}')">Проверить</button>
                            </div>
                            <div id="flag-result${index}"></div>
                            <div id="comment-result${index}"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        const html = `
            <h3>${competition.name}</h3>
            <p>${competition.description}</p>
            <p>Дата начала: ${new Date(competition.startDate).toLocaleString()}</p>
            <p>Дата окончания: ${new Date(competition.endDate).toLocaleString()} часов</p>
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

    window.checkFlag = function(taskId, index) {
        const flagInput = $(`#flag${index}`).val();
        
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/tasks/check_flag_in_competition?task_id=${taskId}&user_flag=${flagInput}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(response) {
                $(`#flag-result${index}`).html(`<div class="alert alert-success">${response.message}</div>`);
            },
            error: function(error) {
                $(`#flag-result${index}`).html(`<div class="alert alert-danger">${error.responseJSON.message}</div>`);
            }
        });
    };

    window.downloadFile = function(taskId) {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/files/downloadfile/?task_id=${taskId}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response, status, xhr) {
                var contentDisposition = xhr.getResponseHeader('Content-Disposition');
                if (contentDisposition) {
                    var filename = contentDisposition.split('filename=')[1];
                    filename = filename.replace(/"/g, '');
                    var url = window.URL.createObjectURL(new Blob([response]));
                    var a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    alert('Не удалось получить имя файла для скачивания.');
                }
            },
            error: function(error) {
                alert('Произошла ошибка при скачивании файла.');
            }
        });
    };

});
