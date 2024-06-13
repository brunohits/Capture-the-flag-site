const email_pattern = RegExp("[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}");
const password_pattern = RegExp("[a-zA-z0-9]{6,}");

document.querySelector("#login").addEventListener("click",()=>{
    document.querySelector("#email").classList.remove("is-invalid");
    document.querySelector("#password").classList.remove("is-invalid");
    if(email_pattern.test(document.querySelector("#email").value) && password_pattern.test(document.querySelector("#password").value)){
        $.ajax({
            url: ``,
            contentType: "application/json",
            method:"POST",
            dataType:"json",
            data: JSON.stringify({
                "email": document.querySelector("#email").value,
                "password":document.querySelector("#password").value
            }),
            success: function(data){
                localStorage.setItem("token",data.token)
            },
            error: function(error){
                const errors = error.responseJSON.errors;
                if(!error.responseJSON.message){
                    if(errors.Email){
                        document.querySelector("#email").classList.add("is-invalid");
                        document.querySelector("#email").parentElement.querySelector(".invalid-feedback").textContent = errors.Email[0];
                    }
                    if(errors.Password){
                        document.querySelector("#password").classList.add("is-invalid");
                        document.querySelector("#password").parentElement.querySelector(".invalid-feedback").textContent = errors.Password[0];
                    }
                }
                else{
                    alert("Аккаунта нет в системе");
                }
            }
        });
    }
    else{
        if(!email_pattern.test(document.querySelector("#email").value)){
            document.querySelector("#email").classList.add("is-invalid");
            document.querySelector("#email").parentElement.querySelector(".invalid-feedback").textContent = "Поле должно соответствовать образцу";
        }
        if(!password_pattern.test(document.querySelector("#password").value)){
            document.querySelector("#password").classList.add("is-invalid");
            document.querySelector("#password").parentElement.querySelector(".invalid-feedback").textContent = "Некорректный пароль";
        }
    }
});