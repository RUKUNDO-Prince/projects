const circle = document.getElementById('circle');
const input = document.getElementById('percent');
const number = document.querySelector('.card__number');
const tooltip = document.querySelector('.tooltip');

function circlePercent() {
    let change = 565.49 - (565.49 * input.value) / 100;
    circle.style.strokeDashoffset = change;
};

function isNumeric(event) {
    if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode > 31)) {
        return false;
    }
    if(event.keyCode == 13) {
        changePercent();
    }
};

function changePercent() {
    if(input.value > 100) {
        tooltip.style.opacity = 1;
        tooltip.classList.add('fade-in');
        input.value = '';

    } else {
        tooltip.style.opacity = 0;
        tooltip.classList.remove('fade-in');
        number.innerHTML = Number(input.value) + '%';
        circlePercent();
        input.value = '';
    }
};