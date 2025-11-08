function validateForm()
{
    const name=document.getElementById("name").value;
    const email=document.getElementById("email").value;
    const pass=document.getElementById("password").value;
   

    const nameErr=document.getElementById("name-error");
    const emailErr=document.getElementById("email-error");
    const passErr=document.getElementById("password-error");


    nameErr.textContent="";
    emailErr.textContent="";
    passErr.textContent="";

    let isValid=true;
    if(name==="" || /\d/.test(name))
    {
        nameErr.textContent="Please enter your name properly.";
        isValid=false;
    }



   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
    emailErr.textContent = "Please enter a valid email address.";
    isValid = false;
    }

    if(pass==="" || pass.length<6)
    {
        passErr.textContent="Please enter a password with at least 6 characters.";
        isValid=false;
    }

    if(isValid)
    {
        return true;
    }
    else{
        return false;
    }
}
function resetErrors()
{
    document.getElementById("name-error").textContent="";
    document.getElementById("email-error").textContent="";
    document.getElementById("password-error").textContent="";
     const backendErrors = document.querySelectorAll(".error");
  backendErrors.forEach(err => (err.style.display = "none"));
}