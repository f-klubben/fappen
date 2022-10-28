import {check_access} from "./stregsystem";


export function registerNavEvents(){
    document.querySelector(".icon").addEventListener("click",toggleNavbar);
}
function getColour(){
    let bool = check_access();
    return bool? "green": "red";
}
function toggleNavbar(){
    let element = document.getElementById("navLinks");
    if(element.style.display === "block"){
        element.style.display = "none";}
    else {
        element.style.display = "block";}
    document.querySelector("#navIndicator").style.background = getColour();
}
