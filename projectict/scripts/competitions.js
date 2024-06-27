$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    let testData;
    let selectedCompetitionId;

    function fetchCompetitions(page = 1, sort = 'name_asc', name = '', type = '') {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/competitions/upcoming-competitions?page=${page}&sort=${sort}&type=${type}&name=${name}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                console.log(data);
                testData = data;
                renderCompetitions(data.competitions);
                renderPagination(data.pagination);
            },
            error: function(error) {
                alert('Ошибка получения данных соревнований: ' + error.responseText);
            }
        });
    }

    function renderCompetitions(competitions) {
        const competitionsList = $('#competitionsList');
        competitionsList.empty();
        competitions.forEach(competition => {
            const competitionItem = $(`
                <div class="list-group-item border mb-2 p-3">
                    <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; width: 100%;">${competition.name}</h4>
                    <p><strong>Дата начала:</strong> ${new Date(competition.start_date).toLocaleString()}</p>
                    <p><strong>Дата окончания:</strong> ${competition.end_date}</p>
                    <p><strong>Тип:</strong> ${competition.type === 'small' ? 'Малое' : 'Большое'}</p>
                    <p><strong>Доступ:</strong> ${competition.isClosed === true ? 'Закрытое' : 'Открытое'}</p>
                    <p style="white-space: normal; word-wrap: break-word;"><strong>Описание:</strong> ${competition.description}</p>
                    <button class="btn btn-primary join-competition-btn" data-id="${competition.id}" data-closed="${competition.is_private}" data-can-create="${competition.can_create_team}">Присоединиться</button>
                </div>
            `);
            competitionsList.append(competitionItem);
        });
    }

    function renderPagination(pagination) {
        const paginationContainer = $('#pagination-container');
        const paginationList = paginationContainer.find('.pagination');
        paginationList.empty();
        var pages = pagination.count / 10;
        if(pagination.count % 10 > 0) pages = pages + 1;
        if (pagination.count / 10 > 1) {
            paginationContainer.removeClass('d-none');
            if (pagination.current_page > 1) {
                paginationList.append(`<li class="page-item"><a class="page-link" href="#" aria-label="prev" data-page="${pagination.current_page - 1}"><span aria-hidden="true">&laquo;</span></a></li>`);
            }
            for (let i = 1; i <= pages; i++) {
                paginationList.append(`<li class="page-item ${i === pagination.current_page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
            }
            if (pagination.current_page < pages) {
                paginationList.append(`<li class="page-item"><a class="page-link" href="#" aria-label="next" data-page="${pagination.current_page + 1}"><span aria-hidden="true">&raquo;</span></a></li>`);
            }
        } else {
            paginationContainer.addClass('d-none');
        }
    }

    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        const sort = $('#sortSelect').val();
        const name = $('#name').val();
        const type = $('#filterSelect').val();
        fetchCompetitions(page, sort, name, type);
    });

    $('#applyFilters').on('click', function() {
        const sort = $('#sortSelect').val();
        const name = $('#name').val();
        const type = $('#filterSelect').val();
        fetchCompetitions(1, sort, name, type);
    });

    $(document).on('click', '.join-competition-btn', function() {
        const competitionId = $(this).data('id');
        selectedCompetitionId = competitionId;
        const isClosed = $(this).data('closed');
        $('#competitionCodeContainer').toggleClass('d-none', !isClosed);
        $('#newTeamNameContainer').toggleClass('d-none', true);
        const teamSelect = $('#teamSelect');
        teamSelect.empty();
        fetchTeams(competitionId);
        $('#joinModal').modal('show');
    });

    function fetchTeams(competitionId) {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/competitions/${competitionId}/teams`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                populateTeams(data.teams, competitionId);
            },
            error: function(error) {
                alert('Ошибка получения данных команд: ' + error.responseText);
            }
        });
    }

    function populateTeams(teams, competitionId) {
        const teamSelect = $('#teamSelect');
        teamSelect.empty();
        teamSelect.append('<option value="none">--</option>');
        teams.forEach(team => {
            teamSelect.append(`<option value="${team.id}">${team.name}</option>`);
        });
        const selectedCompetition = testData.competitions.find(comp => comp.id === competitionId);
        if (selectedCompetition && selectedCompetition.can_create_team) {
            teamSelect.append('<option value="create">Создать новую команду</option>');
        }
    }

    $('#teamSelect').on('change', function() {
        const selectedValue = $(this).val();
        console.log("Selected value:", selectedValue);
        if (selectedValue === 'create') {
            $('#newTeamNameContainer').removeClass('d-none');
        } else {
            $('#newTeamNameContainer').addClass('d-none');
        }
    });

    $('#joinCompetitionButton').on('click', function() {
        const competitionId = selectedCompetitionId;
        const teamId = $('#teamSelect').val();
        const code = $('#competitionCode').val();
        const newTeamName = $('#newTeamName').val();

        var newUrl = ``;

        if(teamId == 'create'){
            newUrl = `http://127.0.0.1:8000/competitions/teams/${competitionId}/join_or_create?new_team_name=${newTeamName}`;
        }else{
            newUrl = `http://127.0.0.1:8000/competitions/teams/${competitionId}/join_or_create?team_id=${teamId}`;
        }

        if(testData.isClosed){
            newUrl += `&enter_code=${code}`;
        }

        console.log(newUrl);

        if(teamId == "none"){
            alert("Нужно выбрать команду");
        }else{
            $.ajax({
                method: "POST",
                url: `newUrl`,
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                data: {
                    teamId: teamId === 'create' ? null : teamId,
                    code: code,
                    newTeamName: newTeamName
                },
                success: function(data) {
                    $('#joinModal').modal('hide');
                    fetchCompetitions();
                },
                error: function(error) {
                    alert('Ошибка присоединения к соревнованию: ' + error.responseText);
                }
            });
        }
    });

    fetchCompetitions();
});
