document.querySelector("head").innerHTML = `<meta charset="UTF-8">`;

let route = window.location.pathname;
console.log(route);
switch (route) {
    case "/login":
        $.get("html/login.html", (data) => {
            updatepage(data);
            document.querySelector("head").innerHTML += `
            <title>login</title>
            `;
        });
        break;
    case "/registration":
        $.get("html/registration.html", (data) => {
            updatepage(data);
            document.querySelector("head").innerHTML += `
            <title>registration</title>
            `;
        });
        break;
    case "/profile":
        $.get("html/profile.html", (data) => {
            updatepage(data);
            document.querySelector("head").innerHTML += `
            <title>profile</title>
            `;
        });
        break;
    case "/examples":
        $.get("html/examples.html", (data) => {
            updatepage(data);
            document.querySelector("head").innerHTML += `
            <title>examples</title>
            `;
        });
        break;
    case "/raiting":
        $.get("html/raiting.html", (data) => {
            updatepage(data);
            document.querySelector("head").innerHTML += `
            <title>raiting</title>
            `;
            loadRatingPage();
        });
        break;
    default:
        if (route.startsWith("/oldCompetition/")) {
            $.get("html/oldCompetition.html", (data) => {
                updatepage(data);
                document.querySelector("head").innerHTML += `
                <title>oldCompetition</title>
                `;
            });
        }
        break;
}

function updatepage(page) {
    $("main").html(page);
}