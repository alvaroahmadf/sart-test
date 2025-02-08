let experimentDuration = 10; // 10 detik
let timer;
let displayInterval; // Untuk interval tampilan angka
let responses = [];
let isExperimentRunning = false; // Menandakan apakah eksperimen sedang berjalan

function startExperiment() {
    document.getElementById('feedback').textContent = '';
    isExperimentRunning = true; // Set eksperimen berjalan
    displayNumber();
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        experimentDuration--;
        if (experimentDuration <= 0) {
            clearInterval(timer);
            endExperiment();
        }
    }, 1000);
}

function endExperiment() {
    clearInterval(timer);
    clearInterval(displayInterval); // Hentikan interval tampilan angka
    document.getElementById('number-display').textContent = '';
    document.getElementById('feedback').textContent = 'Test finished!';
    console.log(responses);
    isExperimentRunning = false; // Set eksperimen tidak berjalan
}

function displayNumber() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];
    document.getElementById('number-display').textContent = randomNumber;

    // Beri kesempatan untuk menekan spasi selama 1000ms
    setTimeout(() => {
        // Tampilkan lingkaran setelah 500ms
        document.getElementById('number-display').textContent = '●'; // Tampilkan lingkaran
        setTimeout(() => {
            // Setelah 500ms, kembali ke angka
            if (isExperimentRunning) {
                displayNumber(); // Tampilkan angka lagi
            }
        }, 500);
    }, 500);
}

function checkResponse(number) {
    const responseTime = new Date().getTime();
    const response = {
        number: number,
        responseTime: responseTime,
        correct: number !== 3
    };
    responses.push(response);

    // Berikan feedback
    if (number === 3) {
        document.getElementById('feedback').textContent = 'Wrong! You should not have pressed the spacebar.';
    } else {
        document.getElementById('feedback').textContent = 'Correct!';
    }
}

// Event listener untuk mendeteksi penekanan spasi
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isExperimentRunning) {
        const displayedNumber = parseInt(document.getElementById('number-display').textContent);
        checkResponse(displayedNumber);
    }
});

// Mulai eksperimen saat halaman dimuat
startExperiment();