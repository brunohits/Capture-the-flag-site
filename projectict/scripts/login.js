const email_pattern = RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,4}");
    const password_pattern = RegExp("[a-zA-Z0-9]{6,}");

    document.querySelector("#loginBut").addEventListener("click", () => {
        const email = document.querySelector("#email");
        const password = document.querySelector("#password");

        email.classList.remove("is-invalid");
        password.classList.remove("is-invalid");

        let isValid = true;

        if (!email_pattern.test(email.value.trim())) {
            email.classList.add("is-invalid");
            email.parentElement.querySelector(".invalid-feedback").textContent = "Введите корректный email";
            isValid = false;
        }

        if (!password_pattern.test(password.value.trim())) {
            password.classList.add("is-invalid");
            password.parentElement.querySelector(".invalid-feedback").textContent = "Пароль должен быть не менее 6 символов";
            isValid = false;
        }

        if (!isValid) return;

        const loginData = {
            email: email.value.trim(),
            password: password.value.trim()
        };

        // Реальный AJAX-запрос закомментирован
        /*
        $.ajax({
            method: "POST",
            url: "",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(loginData),
            success: function(data) {
                localStorage.setItem("token", data.token);
                window.location.href = '/';
            },
            error: function(error) {
                const errors = error.responseJSON.errors;
                if (!error.responseJSON.message) {
                    if (errors.Email) {
                        email.classList.add("is-invalid");
                        email.parentElement.querySelector(".invalid-feedback").textContent = errors.Email[0];
                    }
                    if (errors.Password) {
                        password.classList.add("is-invalid");
                        password.parentElement.querySelector(".invalid-feedback").textContent = errors.Password[0];
                    }
                } else {
                    alert("Аккаунта нет в системе");
                }
            }
        });
        */

        // Тестовые данные
        const testUser = {
            email: "test@example.com",
            password: "password123",
            token: "fake-jwt-token"
        };

        // Симуляция успешного логина
        if (loginData.email === testUser.email && loginData.password === testUser.password) {
            console.log("asdasda");
            localStorage.setItem("token", testUser.token);
            alert("Успешный вход");
            window.location.href = '/';
        } else {
            if (loginData.email !== testUser.email) {
                email.classList.add("is-invalid");
                email.parentElement.querySelector(".invalid-feedback").textContent = "Email не найден";
            }
            if (loginData.password !== testUser.password) {
                password.classList.add("is-invalid");
                password.parentElement.querySelector(".invalid-feedback").textContent = "Неверный пароль";
            }
        }
    });