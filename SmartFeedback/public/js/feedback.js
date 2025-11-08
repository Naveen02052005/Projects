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

 document.querySelector(".submit").addEventListener("click",()=>{
    document.querySelector(".feedback-container").style.display="block";
 })