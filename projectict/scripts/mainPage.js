window.addEventListener("load", ()=>{
    const token = localStorage.getItem("token");
    if(!token){
        showLoggedOutView();
    }else{
        $.ajax({
            url: `http://127.0.0.1:8000/register/users/me/username`,
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: "application/json",
            success: function(data){
                showLoggedInView(data)
            },
            error: function(t){
                localStorage.removeItem("token");
                showLoggedOutView();
            }
        })
    }
});

document.querySelector("#logout").addEventListener("click", ()=>{
    const token = localStorage.getItem("token");

    if(!token){
        showLoggedOutView();
        window.location.href = '/login';
    }else{
        localStorage.removeItem("token");
        showLoggedOutView();
        window.location.href = '/login';
    }
});

function showLoggedOutView() {
    document.querySelector("#dropdownMenu").style.display = "none";
    document.querySelector("#login").style.display = "block";
    document.querySelector("#examples").style.display = "none";
    document.querySelector("#competitions").style.display = "none";
    if (window.location.pathname !== "/login" && window.location.pathname !== "/registration") {
        window.location.href = "/login";
    }
}

function showLoggedInView(username) {
    document.querySelector("#dropdownMenu").textContent = username;
    document.querySelector("#dropdownMenu").style.display = "block";
    document.querySelector("#login").style.display = "none";
    document.querySelector("#examples").style.display = "block";
    document.querySelector("#competitions").style.display = "block";
}