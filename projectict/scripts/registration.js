const email_pattern = RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,4}");
const password_pattern = RegExp("[a-zA-Z0-9]{6,}");

window.addEventListener("load", ()=>{
    console.log("registration");
});

document.querySelector("#registrationClick").addEventListener("click", () => {
    const nick = document.querySelector("#nick");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const passwordAgain = document.querySelector("#passwordAgain");
    
    [nick, email, password, passwordAgain].forEach(input => {
        input.classList.remove("is-invalid");
    });

    let isValid = true;

    if (nick.value === '') {
        nick.classList.add("is-invalid");
        isValid = false;
    }

    if (!email_pattern.test(email.value)) {
        email.classList.add("is-invalid");
        email.parentElement.querySelector(".invalid-feedback").textContent = "Введите корректный email";
        isValid = false;
    }

    if (!password_pattern.test(password.value)) {
        password.classList.add("is-invalid");
        password.parentElement.querySelector(".invalid-feedback").textContent = "Пароль должен быть не менее 6 символов";
        isValid = false;
    }

    if (passwordAgain.value !== password.value) {
        passwordAgain.classList.add("is-invalid");
        passwordAgain.parentElement.querySelector(".invalid-feedback").textContent = "Пароли должны совпадать";
        isValid = false;
    }

    if (!isValid) return;

    const registrationData = {
        email: email.value,
        username: nick.value,
        password: password.value
    };

    $.ajax({
        method: "POST",
        url: "http://127.0.0.1:8000/register",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(registrationData),
        success: function(data) {
            localStorage.setItem("token", data.access_token);
            console
            window.location.href = '/';
        },
        error: function(error) {
            const errors = error.responseJSON.errors;
        }
    });
});