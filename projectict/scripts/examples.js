$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    function fetchExamples(page = 1, sort = 'name_desc', filter = 'all') {
        const name = $('#name').val();
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "GET",
            url: `https://mis-api.kreosoft.space/api/examples?page=${page}&sort=${sort}&filter=${filter}&name=${name}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                renderExamples(data.examples);
                renderPagination(data.pagination);
                populateFilterOptions(data.types);
            },
            error: function(error) {
                alert('Ошибка получения данных примеров: ' + error.responseText);
            }
        });
        */

        // Тестовые данные
        const testExamples = [
            {
                id: 1,
                name: "Пример 1",
                type: "Тип 1",
                difficulty: "Легкая",
                description: "Описание примера 1",
                image: null,
                file: null,
                link: null,
                text: "Текст примера 1",
                comments: [
                    { name: "Пользователь 1", date: "2023-06-24", text: "Комментарий 1" },
                    { name: "Пользователь 2", date: "2023-06-25", text: "Комментарий 2" }
                ]
            },
            {
                id: 2,
                name: "Пример 2",
                type: "Тип 2",
                difficulty: "Средняя",
                description: "Описание примера 2",
                image: "https://via.placeholder.com/150",
                file: null,
                link: null,
                text: null,
                comments: []
            }
        ];
        const testPagination = { current_page: 1, total_pages: 1 };
        const testTypes = ["Тип 1", "Тип 2", "Тип 3"];

        renderExamples(testExamples);
        renderPagination(testPagination);
        populateFilterOptions(testTypes);
    }

    function renderExamples(examples) {
        const accordion = $('#accordion1');
        accordion.empty();
        examples.forEach((example, index) => {
            const exampleItem = $(`
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                            <div class="col text-center">${example.name}</div>
                            <div class="col text-center">${example.type}</div>
                            <div class="col text-center">${example.difficulty}</div>
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordion1">
                        <div class="accordion-body">
                            <div class="h5">Описание</div>
                            <p>${example.description}</p>
                            ${renderMedia(example)}
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="flag${index}" placeholder="Введите флаг">
                                <button class="btn btn-primary" onclick="checkFlag('${example.id}', '#flag${index}')">Проверить</button>
                            </div>
                            <div id="flag-result${index}"></div>
                            <div class="h5 mt-3">Комментарии</div>
                            ${renderComments(example.comments)}
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="comment${index}" placeholder="Введите комментарий">
                                <button class="btn btn-primary" onclick="addComment('${example.id}', '#comment${index}', ${index})">Добавить комментарий</button>
                            </div>
                            <div id="comment-result${index}"></div>
                        </div>
                    </div>
                </div>
            `);
            accordion.append(exampleItem);
        });
    }

    function renderMedia(example) {
        if (example.image) {
            return `<img src="${example.image}" class="img-fluid">`;
        } else if (example.file) {
            return `<a href="${example.file}" download>Скачать файл</a>`;
        } else if (example.link) {
            return `<a href="${example.link}" target="_blank">Перейти по ссылке</a>`;
        } else if (example.text) {
            return `<p>${example.text}</p>`;
        }
        return '';
    }

    function renderComments(comments) {
        let commentsHtml = '';
        comments.forEach(comment => {
            commentsHtml += `
                <div class="border p-2 mb-2">
                    <strong>${comment.name}</strong> (${new Date(comment.date).toLocaleDateString()}): ${comment.text}
                </div>
            `;
        });
        return commentsHtml;
    }

    function renderPagination(pagination) {
        const paginationContainer = $('#pagination-container');
        const paginationList = paginationContainer.find('.pagination');
        paginationList.empty();
        if (pagination.total_pages > 1) {
            paginationContainer.removeClass('d-none');
            if (pagination.current_page > 1) {
                paginationList.append(`<li class="page-item"><a class="page-link" href="#" aria-label="prev" data-page="${pagination.current_page - 1}"><span aria-hidden="true">&laquo;</span></a></li>`);
            }
            for (let i = 1; i <= pagination.total_pages; i++) {
                paginationList.append(`<li class="page-item ${i === pagination.current_page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
            }
            if (pagination.current_page < pagination.total_pages) {
                paginationList.append(`<li class="page-item"><a class="page-link" href="#" aria-label="next" data-page="${pagination.current_page + 1}"><span aria-hidden="true">&raquo;</span></a></li>`);
            }
        } else {
            paginationContainer.addClass('d-none');
        }
    }

    function populateFilterOptions(types) {
        const filterSelect = $('#filterSelect');
        filterSelect.empty();
        filterSelect.append('<option value="all">Любые</option>');
        types.forEach(type => {
            filterSelect.append(`<option value="${type}">${type}</option>`);
        });
    }

    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        const sort = $('#sortSelect').val();
        const filter = $('#filterSelect').val();
        fetchExamples(page, sort, filter);
    });

    $('#find').on('click', function() {
        const sort = $('#sortSelect').val();
        const filter = $('#filterSelect').val();
        fetchExamples(1, sort, filter);
    });

    window.checkFlag = function(exampleId, flagInputSelector) {
        const flag = $(flagInputSelector).val();
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "POST",
            url: `https://mis-api.kreosoft.space/api/examples/${exampleId}/checkFlag`,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ flag }),
            success: function(response) {
                $(flagInputSelector).next('.invalid-feedback').remove();
                if (response.correct) {
                    $(flagInputSelector).after('<div class="valid-feedback d-block">Правильно!</div>');
                } else {
                    $(flagInputSelector).after('<div class="invalid-feedback d-block">Неправильно!</div>');
                }
            },
            error: function(error) {
                alert('Ошибка проверки флага: ' + error.responseText);
            }
        });
        */

        // Тестовый ответ
        const correctFlag = "testFlag";
        $(flagInputSelector).next('.invalid-feedback').remove();
        if (flag === correctFlag) {
            $(flagInputSelector).after('<div class="valid-feedback d-block">Правильно!</div>');
        } else {
            $(flagInputSelector).after('<div class="invalid-feedback d-block">Неправильно!</div>');
        }
    };

    window.addComment = function(exampleId, commentInputSelector, index) {
        const text = $(commentInputSelector).val();
        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "POST",
            url: `https://mis-api.kreosoft.space/api/examples/${exampleId}/comments`,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ text }),
            success: function(response) {
                $(commentInputSelector).val('');
                $('#comment-result' + index).html('<div class="valid-feedback d-block">Комментарий добавлен!</div>');
                fetchExamples();
            },
            error: function(error) {
                alert('Ошибка добавления комментария: ' + error.responseText);
            }
        });
        */

        // Тестовый ответ
        $(commentInputSelector).val('');
        $('#comment-result' + index).html('<div class="valid-feedback d-block">Комментарий добавлен!</div>');
    };

    // Initial fetch
    fetchExamples();
});