const cursor = document.querySelector(".cursor");
let timeout;

// FOLLOW CURSOR FOR MOUSE MOVE
document.addEventListener("mousemove", (e) => {
    const x = e.pageX;
    const y = e.pageY;

    cursor.style.top = y + 'px';
    cursor.style.left = x + 'px';
    cursor.style.display = 'block';

    // CURSOR EFFECTS ON MOUSE STOPPED
    function mouseStopped() {
        cursor.style.display = 'none'; 
    }
    clearTimeout(timeout);
    timeout = setTimeout(mouseStopped, 1000);
});

// CURSOR EFFECTS ON MOUSEOUT
document.addEventListener('mouseout', () => {
    cursor.style.display = 'none';
});