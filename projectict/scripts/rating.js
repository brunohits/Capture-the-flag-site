$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    function fetchRating(page = 1, sort = 'name_desc', name = '') {
        // Тестовые данные
        const testData = {
            users: [
                {
                    name: "John Doe",
                    registrationDate: "2022-01-15T00:00:00Z",
                    winRate: 75,
                    averageScore: 85
                },
                {
                    name: "Jane Smith",
                    registrationDate: "2021-05-20T00:00:00Z",
                    winRate: 60,
                    averageScore: 78
                },
                {
                    name: "Mike Johnson",
                    registrationDate: "2023-02-10T00:00:00Z",
                    winRate: 82,
                    averageScore: 90
                }
            ],
            pagination: {
                total_pages: 1,
                current_page: 1
            }
        };

        // Используем тестовые данные для отрисовки
        renderRating(testData.users);
        renderPagination(testData.pagination);
    }

    function renderRating(users) {
        const ratingContainer = $('#rating');
        ratingContainer.empty();
        users.forEach(user => {
            const userItem = $(`
                <div class="border row p-2 align-items-center mb-1">
                    <div class="col">${user.name}</div>
                    <div class="col">${new Date(user.registrationDate).toLocaleDateString()}</div>
                    <div class="col">${user.winRate}%</div>
                    <div class="col">${user.averageScore}</div>
                </div>
            `);
            ratingContainer.append(userItem);
        });
    }

    function renderPagination(pagination) {
        const paginationContainer = $('.pagination');
        paginationContainer.empty();
        if (pagination.total_pages > 1) {
            if (pagination.current_page > 1) {
                paginationContainer.append(`<li class="page-item"><a class="page-link" href="#" aria-label="prev" data-page="${pagination.current_page - 1}"><span aria-hidden="true">&laquo;</span></a></li>`);
            }
            for (let i = 1; i <= pagination.total_pages; i++) {
                paginationContainer.append(`<li class="page-item ${i === pagination.current_page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
            }
            if (pagination.current_page < pagination.total_pages) {
                paginationContainer.append(`<li class="page-item"><a class="page-link" href="#" aria-label="next" data-page="${pagination.current_page + 1}"><span aria-hidden="true">&raquo;</span></a></li>`);
            }
        }
    }

    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        const sort = $('#sortSelect').val();
        const name = $('#name').val();
        fetchRating(page, sort, name);
    });

    $('#find').on('click', function() {
        const sort = $('#sortSelect').val();
        const name = $('#name').val();
        fetchRating(1, sort, name);
    });

    // Initial fetch
    fetchRating();
});