let experimentDuration = 10; // Durasi eksperimen dalam detik
let timer;
let responses = [];
let isExperimentRunning = false;
let userResponded = false; // Status apakah pengguna sudah menekan SPACEBAR
let missedResponseTimeout; // Timeout untuk mendeteksi respons yang terlewat
let allowLateResponse = false; // Izinkan respons setelah titik muncul
let delayBeforeNextNumber = 1000; // Jeda perpindahan ke angka berikutnya
let numberToDotDelay = 300; // Waktu sebelum angka berubah menjadi titik (lebih cepat)

function startExperiment() {
    document.getElementById('feedback').textContent = '';
    isExperimentRunning = true;
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
    clearTimeout(missedResponseTimeout);
    document.getElementById('number-display').textContent = '';
    document.getElementById('feedback').textContent = 'Test finished!';
    console.log(responses);
    isExperimentRunning = false;
}

function displayNumber() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];

    document.getElementById('number-display').textContent = randomNumber;
    
    userResponded = false; // Reset status respons
    allowLateResponse = false; // Reset status izin respon lambat
    document.getElementById('feedback').textContent = ''; // Hapus feedback sebelumnya

    // Hapus timeout sebelumnya sebelum membuat timeout baru
    clearTimeout(missedResponseTimeout);

    // Jika angka bukan 3, buat timeout untuk cek apakah pengguna melewatkan respons
    if (randomNumber !== 3) {
        missedResponseTimeout = setTimeout(() => {
            if (!userResponded) {
                document.getElementById('feedback').textContent = 'Incorrect! You missed the response.';
                responses.push({
                    number: randomNumber,
                    responseTime: null,
                    correct: false
                });
            }
        }, 1000); // Waktu tunggu respons
    }

    // Percepat perubahan angka ke titik menjadi 300ms
    setTimeout(() => {
        document.getElementById('number-display').textContent = '●';
        allowLateResponse = true; // Izinkan user menekan SPACEBAR setelah titik muncul

        setTimeout(() => {
            if (isExperimentRunning) {
                displayNumber();
            }
        }, delayBeforeNextNumber); // Jeda sebelum angka berikutnya muncul
    }, numberToDotDelay); // Waktu sebelum angka berubah menjadi titik (300ms)
}

function checkResponse(number) {
    if (userResponded) return; // Jika sudah merespons, abaikan respons tambahan

    userResponded = true; // Tandai bahwa pengguna telah merespons
    clearTimeout(missedResponseTimeout); // Hentikan timeout missed response

    const responseTime = new Date().getTime();
    let correctResponse = number !== 3;
    
    responses.push({
        number: number,
        responseTime: responseTime,
        correct: correctResponse
    });

    if (correctResponse) {
        document.getElementById('feedback').textContent = 'Correct!';
    } else {
        document.getElementById('feedback').textContent = 'Wrong! You should not have pressed the spacebar.';
    }
}

// Event listener untuk SPACEBAR
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isExperimentRunning) {
        const displayedText = document.getElementById('number-display').textContent;

        // Jika angka belum berubah menjadi titik, cek sebagai angka
        if (!isNaN(parseInt(displayedText))) {
            checkResponse(parseInt(displayedText));
        }
        // Jika angka sudah berubah menjadi titik, tetap anggap sebagai "Correct!" jika bukan angka 3
        else if (allowLateResponse) {
            document.getElementById('feedback').textContent = 'Correct!';
            userResponded = true;
            clearTimeout(missedResponseTimeout);
        }
    }
});

startExperiment();
