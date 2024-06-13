window.addEventListener("load", ()=>{
    $.ajax({
        url: ``,
        method: "GET",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        contentType: "application/json",
        success: function(data){
            putin(data)
        },
        error: function(t){
            if(t.status == 401){
                alert("Зарегистрируйтесь");
            }
        }
    })
});

function date_to_normal(date){
    return date.split("T")[0];
}

function date_to_unnormal(date){
    return `${date}T00:00:00.000Z`;
}

function putData(data){
    document.querySelector("#email").value = data.email;
    document.querySelector("#nick").value = data.name;
}

document.querySelector("#Save").addEventListener("click", ()=>{
    const data = {
        "email": document.querySelector("#email").value,
        "nick": document.querySelector("#nick").value,
    };
    console.log(JSON.stringify(data));
    $.ajax({
        url: ``,
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
        error: function(t){
            if (t.status == 200){
                alert("Изменено");
            }
            else if(t.status == 401){
                alert("Зарегистрируйтесь");
            }
        }
    })
});