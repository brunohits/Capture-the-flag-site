$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const email_pattern = RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,4}");
    const nick_pattern = RegExp(".+");

    function fetchProfileData() {
        // Закомментируем реальный AJAX-запрос для тестирования
        /*
        $.ajax({
            method: "GET",
            url: "https://example.com/api/profile",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                $('#nick').val(data.nick);
                $('#email').val(data.email);
                renderHistory(data.history);
                renderPagination(data.history.pagination);
            },
            error: function(error) {
                alert('Ошибка получения данных профиля: ' + error.responseText);
            }
        });
        */

        // Тестовые данные для проверки
        const testData = {
            nick: "testuser",
            email: "testuser@example.com",
            history: {
                competition: [
                    {
                        date: "2023-01-01",
                        name: "Соревнование 1",
                        type: "Тип 1",
                        duration: "2 часа",
                        points: "100",
                        place: "1",
                        id: "1"
                    },
                    {
                        date: "2023-02-01",
                        name: "Соревнование 2",
                        type: "Тип 2",
                        duration: "3 часа",
                        points: "80",
                        place: "2",
                        id: "2"
                    }
                ],
                pagination: {
                    count: 1
                }
            }
        };

        // Отображение тестовых данных
        $('#nick').val(testData.nick);
        $('#email').val(testData.email);
        renderHistory(testData.history);
        renderPagination(testData.history.pagination);
    }

    function renderHistory(history) {
        const historyContainer = $('#history');
        historyContainer.empty();
        history.competition.forEach(item => {
            const competitionDiv = $(`
                <div class="border row p-2 align-items-center mb-1">
                    <div class="col">${new Date(item.date).toLocaleDateString()}</div>
                    <div class="col">${item.name}</div>
                    <div class="col">${item.type}</div>
                    <div class="col">${item.duration}</div>
                    <div class="col">${item.points}</div>
                    <div class="col">${item.place}</div>
                    <div class="col btn btn-primary" data-id="${item.id}">Подробнее</div>
                </div>
            `);
            historyContainer.append(competitionDiv);
        });
    }

    function renderPagination(pagination) {
        const paginationContainer = $('.pagination');
        paginationContainer.empty();
        for (let i = 1; i <= pagination.count; i++) {
            const pageLink = $(`
                <button class="page-link" data-page="${i}">${i}</button>
            `);
            paginationContainer.append(pageLink);
        }

        $('.page-link').on('click', function() {
            const page = $(this).data('page');
            fetchHistoryPage(page);
        });
    }

    function fetchHistoryPage(page) {
        // Закомментируем реальный AJAX-запрос для тестирования
        /*
        $.ajax({
            method: "GET",
            url: `https://example.com/api/history?page=${page}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderHistory(data.history);
                renderPagination(data.history.pagination);
            },
            error: function(error) {
                alert('Ошибка получения данных истории: ' + error.responseText);
            }
        });
        */
        // Тестовые данные для проверки
        const testHistoryData = {
            competition: [
                {
                    date: "2023-01-01",
                    name: "Соревнование 1",
                    type: "Тип 1",
                    duration: "2 часа",
                    points: "100",
                    place: "1",
                    id: "1"
                },
                {
                    date: "2023-02-01",
                    name: "Соревнование 2",
                    type: "Тип 2",
                    duration: "3 часа",
                    points: "80",
                    place: "2",
                    id: "2"
                }
            ],
            pagination: {
                count: 1
            }
        };
        renderHistory(testHistoryData);
        renderPagination(testHistoryData.pagination);
    }

    $('#save').on('click', function() {
        const nick = $('#nick').val().trim();
        const email = $('#email').val().trim();

        let isValid = true;

        if (!nick_pattern.test(nick)) {
            $('#nick').addClass("is-invalid");
            isValid = false;
        } else {
            $('#nick').removeClass("is-invalid");
        }

        if (!email_pattern.test(email)) {
            $('#email').addClass("is-invalid");
            isValid = false;
        } else {
            $('#email').removeClass("is-invalid");
        }

        if (!isValid) return;

        const profileData = { nick, email };

        // Закомментируем реальный AJAX-запрос для тестирования
        /*
        $.ajax({
            method: "PUT",
            url: "https://example.com/api/profile",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(profileData),
            success: function() {
                alert('Профиль успешно обновлен');
            },
            error: function(error) {
                alert('Ошибка обновления профиля: ' + error.responseText);
            }
        });
        */
        // Тестовое сообщение для проверки
        alert('Профиль успешно обновлен');
    });

    $('#history').on('click', '.btn-primary', function() {
        const competitionId = $(this).data('id');
        window.location.href = `/competition/${competitionId}`;
    });

    fetchProfileData();
});