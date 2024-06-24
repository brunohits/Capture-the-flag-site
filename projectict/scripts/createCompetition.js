$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    $('#isPrivate').on('change', function() {
        if ($(this).val() === 'true') {
            $('#competitionCodeContainer').removeClass('d-none');
        } else {
            $('#competitionCodeContainer').addClass('d-none');
        }
    });

    $('#searchTasks').on('click', function() {
        const taskName = $('#taskNameSearch').val();
        const taskType = $('#taskTypeSearch').val();
        const taskDifficulty = $('#taskDifficultySearch').val();
        fetchTasks(taskName, taskType, taskDifficulty);
    });

    function fetchTasks(name, type, difficulty) {
        // Реальный AJAX-запрос закомментирован
        /*
        const url = `https://mis-api.kreosoft.space/api/examples?name=${name}&type=${type}&difficulty=${difficulty}`;
        $.ajax({
            method: "GET",
            url: url,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderTaskList(data.examples);
            },
            error: function(error) {
                alert('Ошибка поиска задач: ' + error.responseText);
            }
        });
        */

        // Тестовые данные
        const testTasks = [
            { id: 1, name: "Задача 1", type: "type1", difficulty: "easy" },
            { id: 2, name: "Задача 2", type: "type2", difficulty: "medium" },
            { id: 3, name: "Задача 3", type: "type3", difficulty: "hard" }
        ];
        renderTaskList(testTasks);
    }

    function renderTaskList(tasks) {
        const taskList = $('#taskList');
        taskList.empty();
        tasks.forEach(task => {
            const taskItem = $(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${task.name} (Сложность: ${task.difficulty}, Тип: ${task.type})
                    <button class="btn btn-sm btn-primary add-task" data-id="${task.id}" data-name="${task.name}">Добавить</button>
                </li>
            `);
            taskList.append(taskItem);
        });

        $('.add-task').on('click', function() {
            const taskId = $(this).data('id');
            const taskName = $(this).data('name');
            addTaskToSelectedList(taskId, taskName);
        });
    }

    function addTaskToSelectedList(taskId, taskName) {
        const selectedTaskList = $('#selectedTaskList');
        const taskItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${taskName}
                <button class="btn btn-sm btn-danger remove-task" data-id="${taskId}">Удалить</button>
            </li>
        `);
        selectedTaskList.append(taskItem);

        $('.remove-task').on('click', function() {
            $(this).closest('li').remove();
        });
    }

    $('#create-competition-form').on('submit', function(e) {
        e.preventDefault();

        const selectedTasks = [];
        $('#selectedTaskList .remove-task').each(function() {
            selectedTasks.push($(this).data('id'));
        });

        const durationHours = parseInt($('#durationHours').val());
        const durationMinutes = parseInt($('#durationMinutes').val());
        const totalDuration = durationHours * 60 + durationMinutes;

        const competitionData = {
            name: $('#competitionName').val(),
            description: $('#competitionDescription').val(),
            startDate: $('#startDate').val(),
            duration: totalDuration,
            maxTeams: $('#maxTeams').val(),
            teamSize: $('#teamSize').val(),
            teamName: $('#teamName').val(),
            isPrivate: $('#isPrivate').val() === 'true',
            code: $('#isPrivate').val() === 'true' ? $('#competitionCode').val() : null,
            tasks: selectedTasks
        };

        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "POST",
            url: "https://mis-api.kreosoft.space/api/competitions",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(competitionData),
            success: function(response) {
                alert('Соревнование успешно создано!');
                window.location.href = '/competitions';
            },
            error: function(error) {
                alert('Ошибка создания соревнования: ' + error.responseText);
            }
        });
        */

        // Тестовый ответ
        alert('Соревнование успешно создано!');
        window.location.href = '/competitions';
    });
});