const hour = document.querySelector("#hour");
const minute = document.querySelector("#minute");
const second = document.querySelector("#second");
const half = document.querySelector("#half");
const sp = document.querySelectorAll("span");
//
window.addEventListener("load", () => {
  setInterval(() => {
    let dt = new Date();
    sp[0].textContent = dt.getHours();
    sp[1].textContent = dt.getMinutes();
    if(dt.getSeconds() < 10){
     sp[2].textContent = `0${dt.getSeconds()}`
    }else{
     sp[2].textContent = `${dt.getSeconds()}`;
    };
    sp[3].textContent = dt.getHours() < 12 ? "AM" : "PM";
    //
    let h_deg = (360 / 12) * dt.getHours();
    hour.style.transform = `rotate(${h_deg}deg)`;
    let m_deg = (360 / 60) * dt.getMinutes();
    minute.style.transform = `rotate(${m_deg}deg)`;
    let s_deg = (360 / 60) * dt.getSeconds();
    second.style.transform = `rotate(${s_deg}deg)`;
  }, 1000);
});