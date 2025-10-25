function validateForm()
{
    const name=document.getElementById("name").value;
    // const addr=document.getElementById("address").value;
    const email=document.getElementById("email").value;
    const pass=document.getElementById("password").value;
    // const sub=document.getElementById("subject").value;
    // const agree=document.getElementById("agree").checked;

    const nameErr=document.getElementById("name-error");
    // const addrErr=document.getElementById("address-error");
    const emailErr=document.getElementById("email-error");
    const passErr=document.getElementById("password-error");
    // const subErr=document.getElementById("subject-error");
    // const agreeErr=document.getElementById("agree-error");

    nameErr.textContent="";
    // addrErr.textContent="";
    emailErr.textContent="";
    passErr.textContent="";
    // subErr.textContent="";
    // agreeErr.textContent="";

    let isValid=true;
    if(name==="" || /\d/.test(name))
    {
        nameErr.textContent="Please enter your name properly.";
        isValid=false;
    }

    // if(addr==="")
    // {
    //     addrErr.textContent="Please enter your address.";
    //     isValid=false;
    // }

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

    // if(sub==="")
    // {
    //     subErr.textContent="Please select your course.";
    //     isValid=false;
    // }

    // if(!agree)
    // {
    //     agreeErr.textContent="Please agree to the above information.";
    //     isValid=false;
    // }

    if(isValid)
    {
        alert("Form submitted successfully!");
        return true;
    }
    else{
        return false;
    }
}
function resetErrors()
{
    document.getElementById("name-error").textContent="";
    // document.getElementById("address-error").textContent="";
    document.getElementById("email-error").textContent="";
    document.getElementById("password-error").textContent="";
    // document.getElementById("subject-error").textContent="";
    // document.getElementById("agree-error").textContent="";
}