function getAcc(){
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href = '/login';
        return;
    } else {
        $.ajax({
            url: `http://127.0.0.1:8000/register/users/me/profile?page=1&page_size=10`,
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: "application/json",
            success: function(data){
                console.log(data);
                showLoggedOutView(data.profile);
                renderHistory(data.history.competition);
                renderPagination(data.history.pagination);
            },
            error: function(){
                window.location.href = '/login';
                return;
            }
        });
    }
};

function showLoggedOutView(data){
    document.querySelector("#nick").value = data.username;
    document.querySelector("#email").value = data.email;
}

function renderHistory(history) {
    const historyContainer = document.querySelector('#history');
    historyContainer.innerHTML = '';
    history.forEach(item => {
        const competitionDiv = document.createElement('div');
        competitionDiv.className = 'border row p-2 align-items-center mb-1';
        competitionDiv.innerHTML = `
            <div class="col">${new Date(item.date).toLocaleDateString()}</div>
            <div class="col">${item.name}</div>
            <div class="col">${item.type}</div>
            <div class="col">${item.end_date}</div>
            <div class="col">${item.points}</div>
            <div class="col">${item.place}</div>
            <div class="col btn btn-primary" data-id="${item.id}">Подробнее</div>
        `;
        historyContainer.appendChild(competitionDiv);
    });
}

function renderPagination(pagination) {
    var pages = pagination.count / 10;
    if(pagination.count % 10 > 0) pages = pages + 1;
    const paginationContainer = document.querySelector('#pagin');
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'page-link';
        pageButton.dataset.page = i;
        pageButton.textContent = i;
        pageButton.addEventListener('click', function() {
            fetchHistoryPage(this.dataset.page);
        });
        paginationContainer.appendChild(pageButton);
    }
}

function fetchHistoryPage(page) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    } else {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/register/users/me/history?page=${page}&page_size=10`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderHistory(data.competition);
                renderPagination(data.pagination);
            },
            error: function() {
                window.location.href = '/login';
                return;
            }
        });
    }
}

document.querySelector('#save').addEventListener('click', function() {
    const token = localStorage.getItem("token");

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const nickPattern = /.+/;

    const nick = document.querySelector('#nick').value;
    const email = document.querySelector('#email').value;

    let isValid = true;

    if (!nickPattern.test(nick)) {
        document.querySelector('#nick').classList.add("is-invalid");
        isValid = false;
    } else {
        document.querySelector('#nick').classList.remove("is-invalid");
    }

    if (!emailPattern.test(email)) {
        document.querySelector('#email').classList.add("is-invalid");
        isValid = false;
    } else {
        document.querySelector('#email').classList.remove("is-invalid");
    }

    if (!isValid) return;

    const profileData = { username: nick, email: email};

    if (!token) {
        window.location.href = '/login';
        return;
    } else {
        $.ajax({
            url: `http://127.0.0.1:8000/register/users/me/editProfile`,
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(profileData),
            success: function(data) {
                localStorage.removeItem("token");
                localStorage.setItem("token", data.access_token);
            },
            error: function(error) {
                console.log(error.responseText);
            }
        });
    }
});

document.querySelector('#history').addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-primary')) {
        const competitionId = event.target.dataset.id;
        window.location.href = `/oldCompetition?id=${competitionId}`;
    }
});

getAcc();