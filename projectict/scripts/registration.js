const email_pattern = RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,4}");
const password_pattern = RegExp("[a-zA-Z0-9]{6,}");

document.querySelector("#registrationClick").addEventListener("click", () => {
    const nick = document.querySelector("#nick");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const passwordAgain = document.querySelector("#passwordAgain");
    
    [nick, email, password, passwordAgain].forEach(input => {
        input.classList.remove("is-invalid");
    });

    let isValid = true;

    if (nick.value.trim() === '') {
        nick.classList.add("is-invalid");
        isValid = false;
    }

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

    if (passwordAgain.value.trim() !== password.value.trim()) {
        passwordAgain.classList.add("is-invalid");
        passwordAgain.parentElement.querySelector(".invalid-feedback").textContent = "Пароли должны совпадать";
        isValid = false;
    }

    if (!isValid) return;

    const registrationData = {
        nick: nick.value.trim(),
        email: email.value.trim(),
        password: password.value.trim()
    };

    $.ajax({
        method: "POST",
        url: "",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(registrationData),
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
});