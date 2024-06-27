$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return;
    }

    function fetchExamples(page = 1, sort = 'name_desc', filter = '') {
        const name = document.querySelector('#name').value;
        console.log(name);
        console.log(`http://127.0.0.1:8000/tasks?page=${page}&sort=${sort}&filter=${filter}&name=${name}`);
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/tasks?page=${page}&sort=${sort}&filter=${filter}&name=${name}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                console.log(data);
                renderExamples(data.tasks);
                renderPagination(data.pagination);
            },
            error: function(error) {
                alert('Ошибка получения данных примеров: ' + error.responseText);
            }
        });
    }

    function renderExamples(examples) {
        const accordion = $('#accordion1');
        accordion.empty();
        examples.forEach((example, index) => {
            const exampleItem = $(`
                <div class="accordion-item" style="margin-top: 2%">
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                            <div class="col text-center" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${example.name}</div>
                            <div class="col text-center">${example.type}</div>
                            <div class="col text-center">${example.points}</div>
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordion1">
                        <div class="accordion-body">
                            <div class="h5">Описание</div>
                            <div style="white-space: normal; word-wrap: break-word;">${example.description}</div>
                            ${renderMedia(example)}
                            ${renderFileButton(example)}
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="flag${index}" placeholder="Введите флаг">
                                <button class="btn btn-primary" onclick="checkFlag('${example.id}', '#flag${index}')">Проверить</button>
                            </div>
                            <div id="flag-result${index}"></div>
                            <div class="h5 mt-3">Комментарии</div>
                            ${renderComments(example.comment)}
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
            return `<img src="data:image/jpeg;base64,${example.image}" class="img-fluid">`;
        } else if (example.link) {
            return `<a href="${example.link}" target="_blank">Перейти по ссылке</a>`;
        } else if (example.text) {
            return `<p>${example.text}</p>`;
        }
        return '';
    }

    function renderFileButton(example) {
        if (example.file) {
            return `<button class="btn btn-primary" onclick="downloadFile('${example.id}')">Скачать файл</button>`;
        }
        return '';
    }

    function renderComments(comments) {
        let commentsHtml = '';
        comments.forEach(comment => {
            commentsHtml += `
                <div class="border p-2 mb-2">
                    <strong>${comment.author}</strong> (${new Date(comment.date).toLocaleDateString()}): ${comment.content}
                </div>
            `;
        });
        return commentsHtml;
    }

    function renderPagination(pagination) {
        const paginationContainer = $('#pagination-container');
        const paginationList = paginationContainer.find('.pagination');
        paginationList.empty();
        let pages = Math.ceil(pagination.count / 10);
        if (pages > 1) {
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
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/tasks/check_flag?task_id=${exampleId}&user_flag=${flag}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(response) {
                $('.valid-feedback').remove();
                $('.invalid-feedback').remove();

                $(flagInputSelector).next('.invalid-feedback').remove();
                if (response) {
                    $(flagInputSelector).after('<div class="valid-feedback d-block">Правильно!</div>');
                } else {
                    $(flagInputSelector).after('<div class="invalid-feedback d-block">Неправильно!</div>');
                }
            },
            error: function(error) {
                alert('Ошибка проверки флага: ' + error.responseText);
            }
        });
    };

    window.addComment = function(exampleId, commentInputSelector, index) {
        const text = $(commentInputSelector).val();
        $.ajax({
            method: "POST",
            url: `http://127.0.0.1:8000/comments?task_id=${exampleId}&content=${text}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(response) {
                $(commentInputSelector).val('');
                $('#comment-result' + index).html('<div class="valid-feedback d-block">Комментарий добавлен!</div>');
                fetchExamples();
            },
            error: function(error) {
                alert('Ошибка добавления комментария: ' + error.responseText);
            }
        });
    };

    window.downloadFile = function(taskId) {
        $.ajax({
            method: "GET",
            url: `http://127.0.0.1:8000/files/downloadfile/?task_id=${taskId}`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response, status, xhr) {
                var contentDisposition = xhr.getResponseHeader('Content-Disposition');
                if (contentDisposition) {
                    var filename = contentDisposition.split('filename=')[1];
                    filename = filename.replace(/"/g, '');
                    var url = window.URL.createObjectURL(new Blob([response]));
                    var a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    alert('Не удалось получить имя файла для скачивания.');
                }
            },
            error: function(error) {
                alert('Произошла ошибка при скачивании файла.');
            }
        });
    };
    

    fetchExamples();
});
