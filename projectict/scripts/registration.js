function genderTransform(gender){
    switch (gender) {
        case "Мужской":
            return "Male";    
        default:
            return "Female";
    }
}

function return_null(obj){
    if(obj){ return obj; }
    return null;
}

function returndef(id){
    document.querySelector(`#${id}`).classList.remove("is-invalid");
    document.querySelector(`#${id}`).parentElement.querySelector(".invalid-feedback").textContent = "";
}

function correctTime(date){
    return `${date}T00:00:00.000Z`;
}

document.querySelector("#regClick").addEventListener("click",()=>{
    returndef("Name");
    returndef("passwordField");
    returndef("emailField");
    returndef("Speciality");
    const name  = return_null(document.querySelector("#Name").value);
    const password = return_null(document.querySelector("#passwordField").value);
    const email =  return_null(document.querySelector("#emailField").value);
    const phone  = return_null(document.querySelector("#phoneField").value);
    const id = return_null(document.querySelector("#Speciality").getAttribute("sid"));
    const date = return_null(document.querySelector("#Date").value);
    const email_pattern = RegExp("[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}");
    const password_pattern = RegExp("[a-zA-z0-9]{6,}");
    if(email_pattern.test(email) && password_pattern.test(password)&& id && name != ""){
        let data={};
        data.name = name;
        data.password = password;
        data.email = email;
        data.speciality = id;
        data.gender = genderTransform(document.querySelector("#Gender").value);
        if(phone){
            data.phone = phone;
        }
        if(date){
            data.birthday = date;
        }
        console.log(data);
        $.ajax({
            method:"POST",
            url: `https://mis-api.kreosoft.space/api/doctor/register`,
            contentType:"application/json",
            dataType:"json",
            data:JSON.stringify(data),
            success: function(data){
                localStorage.setItem("token", data.token);
            },
            error: function(t){
                alert(t)
            }
        });
    }
    else{
        if(RegExp("[a-zA-Z]{1,1000}").test(name)){
            document.querySelector("#Name").classList.add("is-invalid");
            document.querySelector("#Name").parentElement.querySelector(".invalid-feedback").textContent = "Имя является обязательным пунктом";
        }
        if(!password_pattern.test(password)){
            document.querySelector("#passwordField").classList.add("is-invalid");
            document.querySelector("#passwordField").parentElement.querySelector(".invalid-feedback").textContent = "Пароль не соответствует требованиям(должен быть от 6 символов)";
        }
        if(!email_pattern.test(email)){
            document.querySelector("#emailField").classList.add("is-invalid");
            document.querySelector("#emailField").parentElement.querySelector(".invalid-feedback").textContent = "Email не соответствует требованиям";
        }
        if(!id){
            document.querySelector("#Speciality").classList.add("is-invalid");
            document.querySelector("#Speciality").parentElement.querySelector(".invalid-feedback").textContent = "Поле 'Специальность' должно быть одним из предложенных";
        }
    }
});

document.querySelector("#Speciality").addEventListener("input", (e)=>{
    document.querySelector("datalist").innerHTML = "";
    $.ajax({
        method:"GET",
        url: `https://mis-api.kreosoft.space/api/dictionary/speciality?name=${e.target.value}`,
        contentType:"application/json",
        success: function(data){
            putintodatalist(data)
        },
        error: function(t){
            console.log(t);
        }
    });
});

function putintodatalist(data){
    let datalist = document.querySelector("datalist");
    data.specialties.forEach(spec => {
        console.log(spec);
        datalist.innerHTML +=`<option>${spec.name}</option>`;
        document.querySelector("#Speciality").setAttribute("sid", spec.id);
    });
}