let countdownValue = 3;
let countdownInterval;

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && countdownValue === 3) {
        startCountdown();
    }
});

function startCountdown() {
    document.getElementById('app').innerHTML = `
        <div id="countdown"></div>
    `;
    countdownInterval = setInterval(() => {
        if (countdownValue > 0) {
            document.getElementById('countdown').textContent = `Get Ready!  \n${countdownValue}`;
            countdownValue--;
        } else {
            clearInterval(countdownInterval);
            window.location.href = 'test.html';
        }
    }, 1000);
}
