$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const competitionId = window.location.pathname.split("/")[2];

    function fetchCompetitionData() {
        $.ajax({
            method: "GET",
            url: `https://mis-api.kreosoft.space/api/doctor/competition/${competitionId}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                $('#competition-name').text(data.nameOfCompetition);
                $('#competition-date').text(new Date(data.date).toLocaleDateString());
                $('#competition-duration').text(data.duration);
                $('#team-place').text(data.placeOfYourSquad);
                $('#team-points').text(data.pointsOfYourSquad);

                const tasksBody = $('#tasks-body');
                tasksBody.empty();
                data.tasks.forEach(task => {
                    const taskRow = $(`
                        <tr>
                            <td>${task.name}</td>
                            <td>${task.points}</td>
                            <td>${task.isResolved ? 'Да' : 'Нет'}</td>
                        </tr>
                    `);
                    tasksBody.append(taskRow);
                });

                const teamsBody = $('#teams-body');
                teamsBody.empty();
                data.teams.forEach(team => {
                    const teamRow = $(`
                        <tr>
                            <td>${team.place}</td>
                            <td>${team.name}</td>
                            <td>${team.points}</td>
                        </tr>
                    `);
                    teamsBody.append(teamRow);
                });
            },
            error: function(error) {
                alert('Ошибка получения данных соревнования: ' + error.responseText);
            }
        });
    }

    fetchCompetitionData();
});