$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const competitionId = window.location.pathname.split("/")[2];

    function fetchCompetitionData() {
        // Реальный AJAX-запрос закомментирован
        /*
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
        */

        // Тестовые данные
        const testData = {
            nameOfCompetition: "Медицинское соревнование",
            date: "2023-06-24",
            duration: "2 часа",
            placeOfYourSquad: "3",
            pointsOfYourSquad: "85",
            tasks: [
                { name: "Задача 1", points: 30, isResolved: true },
                { name: "Задача 2", points: 25, isResolved: false },
                { name: "Задача 3", points: 30, isResolved: true }
            ],
            teams: [
                { place: 1, name: "Команда А", points: 95 },
                { place: 2, name: "Команда Б", points: 90 },
                { place: 3, name: "Ваша команда", points: 85 },
                { place: 4, name: "Команда В", points: 80 }
            ]
        };

        // Обработка тестовых данных
        $('#competition-name').text(testData.nameOfCompetition);
        $('#competition-date').text(new Date(testData.date).toLocaleDateString());
        $('#competition-duration').text(testData.duration);
        $('#team-place').text(testData.placeOfYourSquad);
        $('#team-points').text(testData.pointsOfYourSquad);

        const tasksBody = $('#tasks-body');
        tasksBody.empty();
        testData.tasks.forEach(task => {
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
        testData.teams.forEach(team => {
            const teamRow = $(`
                <tr>
                    <td>${team.place}</td>
                    <td>${team.name}</td>
                    <td>${team.points}</td>
                </tr>
            `);
            teamsBody.append(teamRow);
        });
    }

    fetchCompetitionData();
});