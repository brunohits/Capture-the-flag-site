const password_pattern = RegExp("[a-zA-Z0-9]{6,}");

document.querySelector("#loginBut").addEventListener("click", () => {
    const nick = document.querySelector("#nick");
    const password = document.querySelector("#password");

    nick.classList.remove("is-invalid");
    password.classList.remove("is-invalid");

    if (!password_pattern.test(password.value)) {
        password.classList.add("is-invalid");
        password.parentElement.querySelector(".invalid-feedback").textContent = "Пароль должен быть не менее 6 символов";
        return;
    }

    const loginData = new URLSearchParams();
    loginData.append('username', nick.value);
    loginData.append('password', password.value);

    $.ajax({
        method: "POST",
        url: "http://127.0.0.1:8000/login/token",
        contentType: "application/x-www-form-urlencoded",
        data: loginData.toString(),
        success: function(data) {
            localStorage.setItem("token", data.access_token);
            window.location.href = '/';
        },
        error: function(error) {
            let errorMessage = 'Ошибка входа.';
            if (error.status === 400) {
                errorMessage = 'Неверный запрос. Пожалуйста, проверьте введенные данные.';
            }
        }
    });
});