$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    function fetchCompetitions(page = 1, sort = 'startDate', name = '') {
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "GET",
            url: `https://mis-api.kreosoft.space/api/competitions?page=${page}&sort=${sort}&name=${name}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderCompetitions(data.competitions);
                renderPagination(data.pagination);
            },
            error: function(error) {
                alert('Ошибка получения данных соревнований: ' + error.responseText);
            }
        });
        */

        // Тестовые данные
        const testData = {
            competitions: [
                {
                    id: 1,
                    name: "Тестовое соревнование 1",
                    description: "Описание тестового соревнования 1",
                    startDate: new Date(),
                    duration: 24,
                    type: "small",
                    isClosed: false
                },
                {
                    id: 2,
                    name: "Тестовое соревнование 2",
                    description: "Описание тестового соревнования 2",
                    startDate: new Date(),
                    duration: 48,
                    type: "large",
                    isClosed: true
                }
            ],
            pagination: {
                currentPage: page,
                totalPages: 2
            }
        };
        renderCompetitions(testData.competitions);
        renderPagination(testData.pagination);
    }

    function renderCompetitions(competitions) {
        const competitionsList = $('#competitionsList');
        competitionsList.empty();
        competitions.forEach(competition => {
            const competitionItem = $(`
                <div class="list-group-item">
                    <h5>${competition.name}</h5>
                    <p>${competition.description}</p>
                    <p>Дата начала: ${new Date(competition.startDate).toLocaleString()}</p>
                    <p>Длительность: ${competition.duration} часов</p>
                    <p>Тип: ${competition.type === 'small' ? 'Малое' : 'Большое'}</p>
                    <button class="btn btn-primary join-competition-btn" data-id="${competition.id}" data-closed="${competition.isClosed}">Присоединиться</button>
                </div>
            `);
            competitionsList.append(competitionItem);
        });
    }

    function renderPagination(pagination) {
        const paginationContainer = $('#pagination');
        paginationContainer.empty();
        if (pagination.totalPages > 1) {
            if (pagination.currentPage > 1) {
                paginationContainer.append(`<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage - 1}">&laquo;</a></li>`);
            }
            for (let i = 1; i <= pagination.totalPages; i++) {
                paginationContainer.append(`<li class="page-item ${i === pagination.currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
            }
            if (pagination.currentPage < pagination.totalPages) {
                paginationContainer.append(`<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage + 1}">&raquo;</a></li>`);
            }
        }
    }

    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        const sort = $('#sortOption').val();
        const name = $('#competitionNameSearch').val();
        fetchCompetitions(page, sort, name);
    });

    $('#applyFilters').on('click', function() {
        const sort = $('#sortOption').val();
        const name = $('#competitionNameSearch').val();
        fetchCompetitions(1, sort, name);
    });

    $(document).on('click', '.join-competition-btn', function() {
        const competitionId = $(this).data('id');
        const isClosed = $(this).data('closed');
        $('#competitionCodeContainer').toggleClass('d-none', !isClosed);
        fetchTeams(competitionId);
        $('#joinModal').modal('show');
    });

    function fetchTeams(competitionId) {
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "GET",
            url: `https://mis-api.kreosoft.space/api/competitions/${competitionId}/teams`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                populateTeams(data.teams);
            },
            error: function(error) {
                alert('Ошибка получения данных команд: ' + error.responseText);
            }
        });
        */

        // Тестовые данные
        const testTeamsData = {
            teams: [
                { id: 1, name: "Команда 1" },
                { id: 2, name: "Команда 2" },
                { id: 3, name: "Команда 3" }
            ]
        };
        populateTeams(testTeamsData.teams);
    }

    function populateTeams(teams) {
        const teamSelect = $('#teamSelect');
        teamSelect.empty();
        teams.forEach(team => {
            teamSelect.append(`<option value="${team.id}">${team.name}</option>`);
        });
        teamSelect.append('<option value="create">Создать новую команду</option>');
    }

    $('#joinCompetitionButton').on('click', function() {
        const competitionId = $('.join-competition-btn').data('id');
        const teamId = $('#teamSelect').val();
        const code = $('#competitionCode').val();

        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "POST",
            url: `https://mis-api.kreosoft.space/api/competitions/${competitionId}/join`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            data: {
                teamId: teamId === 'create' ? null : teamId,
                code: code
            },
            success: function() {
                alert('Вы успешно присоединились к соревнованию');
                $('#joinModal').modal('hide');
                fetchCompetitions();
            },
            error: function(error) {
                alert('Ошибка присоединения к соревнованию: ' + error.responseText);
            }
        });
        */

        // Тестовый ответ
        alert('Вы успешно присоединились к соревнованию');
        $('#joinModal').modal('hide');
        fetchCompetitions();
    });

    fetchCompetitions();
});