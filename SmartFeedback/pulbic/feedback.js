let product = document.querySelector(".productType");
let service = document.querySelector(".serviceType");

document.getElementById("productRadio").addEventListener("change",function()
{
    if(this.checked)
    {
        product.style.display="block";
        service.style.display="none";

        document.querySelector(".serviceType select").disabled = true;
        document.querySelector(".productType select").disabled =false;
    }
})
document.getElementById("serviceRadio").addEventListener("change",function(){
    if(this.checked)
    {
        service.style.display="block";
        product.style.display="none";

        document.querySelector(".productType select").disabled = true;
        document.querySelector(".serviceType select").disabled = false;
    }
})


// function display()
// {
//     const feedbackDiv = document.createElement("div");
//     feedbackDiv.classList.add("feedback-box");
//     feedbackDiv.style.border = "1px solid #ccc";
//     feedbackDiv.style.padding = "10px";
//     feedbackDiv.style.margin = "10px 0";
//     feedbackDiv.style.borderRadius = "5px";

//     const container = document.getElementById("feedback-container");
//     container.prepend(feedbackDiv);
// }

// document.getElementById("feedbackForm").addEventListener("submit",function(e){
//     e.preventDefault();
//     display();
// })


 document.querySelector(".submit").addEventListener("click",()=>{
    document.querySelector(".feedback-container").style.display="block";
 })