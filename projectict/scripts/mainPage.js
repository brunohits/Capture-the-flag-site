document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const profileDropdown = document.getElementById("dropdownMenu");
    const loginButton = document.getElementById("login");
    const examplesLink = document.getElementById("examples");
    const raitingLink = document.getElementById("raiting");
    const competitionsLink = document.getElementById("competitions");

    const showLoggedInView = (username) => {
        profileDropdown.textContent = username;
        profileDropdown.style.display = "block";
        loginButton.style.display = "none";
        examplesLink.style.display = "block";
        raitingLink.style.display = "block";
        competitionsLink.style.display = "block";
    };

    const showLoggedOutView = () => {
        profileDropdown.style.display = "none";
        loginButton.style.display = "block";
        examplesLink.style.display = "none";
        raitingLink.style.display = "none";
        competitionsLink.style.display = "none";
        if (window.location.pathname !== "/login" && window.location.pathname !== "/registration") {
            window.location.href = "/login";
        }
    };

    if (token) {
        // Реальный запрос к серверу закомментирован для тестирования
        /*
        $.ajax({
            method: "GET",
            url: "/api/profile", // Замените на реальный URL вашего API
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function(data) {
                showLoggedInView(data.username);
            },
            error: function() {
                localStorage.removeItem("token");
                showLoggedOutView();
            }
        });
        */

        // Тестовые данные для эмуляции успешного запроса
        const testProfileData = {
            username: "Имявов Имя Имявович"
        };
        showLoggedInView(testProfileData.username);

        // Код для выхода из аккаунта
        document.getElementById("logout").addEventListener("click", () => {
            localStorage.removeItem("token");
            showLoggedOutView();
        });
    } else {
        showLoggedOutView();
    }
});