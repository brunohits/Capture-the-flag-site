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
        fetchTasks(taskName, taskType);
    });

    function fetchTasks(name, type) {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/tasks?filter=${type}&name=${name}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderTaskList(data.tasks);
            },
            error: function(error) {
                alert('Ошибка поиска задач: ' + error.responseText);
            }
        });
    }

    function renderTaskList(tasks) {
        const taskList = $('#taskList');
        taskList.empty();
        tasks.forEach(task => {
            const taskItem = $(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                
                    <span class="task-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${task.name}">${task.name}</span>
                    <span>(Сложность: ${task.points}, Тип: ${task.type})</span>
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
                <span class="task-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${taskName}</span>
                <div class="input-group input-group-sm ml-2" style="width: 100px;">
                    <input type="number" class="form-control task-cost" placeholder="Стоимость" data-id="${taskId}">
                </div>
                <button class="btn btn-sm btn-danger remove-task" data-id="${taskId}">Удалить</button>
            </li>
        `);
        selectedTaskList.append(taskItem);

        $('.remove-task').on('click', function() {
            $(this).closest('li').remove();
        });
    }

    $('#submit').on('click', function(e) {
        e.preventDefault();

        const selectedTasks = [];
        $('#selectedTaskList .task-cost').each(function() {
            const taskId = $(this).data('id');
            const taskCost = $(this).val();
            selectedTasks.push({ task_id: taskId, points: taskCost });
        });

        const competitionData = {
            name: $('#competitionName').val(),
            description: $('#competitionDescription').val(),
            start_date: $('#startDate').val(),
            end_date: $('#endDate').val(),
            type: "small",
            max_teams: $('#maxTeams').val(),
            team_size: $('#teamSize').val(),
            owner_team_name: $('#teamName').val(),
            is_private: $('#isPrivate').val() === 'true',
            enter_code: $('#isPrivate').val() === 'true' ? $('#competitionCode').val() : null,
            tasks: selectedTasks
        };

        $.ajax({
            method: "POST",
            url: "http://127.0.0.1:8000/competitions/comp/create",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            dataType: "json",
            data: JSON.stringify(competitionData),
            success: function(response) {
                alert('Соревнование успешно создано!');
                window.location.href = '/competitions';
            },
            error: function(error) {
                alert('Ошибка создания соревнования: ' + error.responseText);
            }
        });

        console.log(competitionData);
    });
});