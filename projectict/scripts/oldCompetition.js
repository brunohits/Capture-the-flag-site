function loadPage(){
    console.log("asdasda");
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = '/login';
    return;
}else{
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    const competitionId = urlParams.get('id');
    console.log(competitionId);
    $.ajax({
        url: `http://127.0.0.1:8000/register/competitions/${competitionId}`,
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        success: function(data) {
            console.log(data);
            document.getElementById('competition-name').textContent = data.nameOfCompetition;
            document.getElementById('competition-date').textContent = new Date(data.start_date).toLocaleDateString();
            document.getElementById('competition-duration').textContent = new Date(data.end_date).toLocaleDateString();
            document.getElementById('team-place').textContent = data.placeOfYourSquad;
            document.getElementById('team-points').textContent = data.pointsOfYourSquad;

            const tasksBody = document.getElementById('tasks-body');
            tasksBody.innerHTML = '';
            data.tasks.forEach(task => {
                const taskRow = document.createElement('tr');
                taskRow.innerHTML = `
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${task.name}</td>
                    <td>${task.points}</td>
                    <td>${task.isResolved ? 'Да' : 'Нет'}</td>
                `;
                tasksBody.appendChild(taskRow);
            });

            const teamsBody = document.getElementById('teams-body');
            teamsBody.innerHTML = '';
            data.teams.forEach(team => {
                const teamRow = document.createElement('tr');
                teamRow.innerHTML = `
                    <td>${team.place}</td>
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${team.name}</td>
                    <td>${team.points}</td>
                `;
                teamsBody.appendChild(teamRow);
            });
        },
        error: function(error) {
            alert(error.responseText);
        }
    });
}
}

loadPage();