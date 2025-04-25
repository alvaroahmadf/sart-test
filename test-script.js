// Konfigurasi Eksperimen
let trialsPerSession = 10;
let noGoCountPerSession = 2;
let noGoNumber = 3;
let delayBeforeNextNumber = 900; // Durasi tambahan sebelum ke angka berikutnya
let numberToDotDuration = 250; // Durasi angka sebelum berubah menjadi titik (●)
let incorrectDelayDuration = 3000; // Delay tambahan untuk kondisi incorrect

// Variabel Eksperimen
let trialCount = 0;
let responses = [];
let isExperimentRunning = false;
let userResponded = false;
let allowResponse = false;
let goTrials = 0;
let goMistakes = 0;
let noGoTrials = 0;
let noGoMistakes = 0;
let numberSequence = [];
let startTime = 0;
let timeoutId1 = null; // Untuk timeout perubahan angka ke titik
let timeoutId2 = null; // Untuk timeout transisi ke angka berikutnya

function getLocalTimestamp() {
    let now = new Date();

    // Konversi ke zona waktu Jakarta (UTC+7)
    let options = { timeZone: "Asia/Jakarta" };
    
    let year = new Intl.DateTimeFormat("id-ID", { year: "numeric", ...options }).format(now);
    let month = new Intl.DateTimeFormat("id-ID", { month: "2-digit", ...options }).format(now);
    let day = new Intl.DateTimeFormat("id-ID", { day: "2-digit", ...options }).format(now);
    let hour = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", hour12: false, ...options }).format(now);
    let minute = new Intl.DateTimeFormat("id-ID", { minute: "2-digit", ...options }).format(now);
    let second = new Intl.DateTimeFormat("id-ID", { second: "2-digit", ...options }).format(now);

    // Mendapatkan milidetik (3 digit)
    let millisecond = now.getMilliseconds().toString().padStart(3, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}

// Fungsi untuk memulai eksperimen
function startExperiment() {
    document.getElementById('feedback').textContent = '';
    isExperimentRunning = true;
    trialCount = 0;
    responses = [];
    goTrials = 0;
    goMistakes = 0;
    noGoTrials = 0;
    noGoMistakes = 0;
    generateNumberSequence();
    displayNumber();
}

// Fungsi untuk menghasilkan urutan angka
function generateNumberSequence() {
    let possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== noGoNumber);
    let randomNumbers = [];

    for (let i = 0; i < trialsPerSession - noGoCountPerSession; i++) {
        let randomIndex = Math.floor(Math.random() * possibleNumbers.length);
        randomNumbers.push(possibleNumbers[randomIndex]);
    }

    for (let i = 0; i < noGoCountPerSession; i++) {
        randomNumbers.push(noGoNumber);
    }

    numberSequence = randomNumbers.sort(() => Math.random() - 0.5);
}

// Fungsi untuk menampilkan angka
function displayNumber() {
    if (trialCount >= trialsPerSession) {
        endExperiment();
        return;
    }

    // Hentikan timeout yang masih berjalan
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    let currentNumber = numberSequence[trialCount];
    document.getElementById('number-display').textContent = currentNumber;
    userResponded = false;
    allowResponse = true;
    document.getElementById('feedback').textContent = '';

    startTime = new Date().getTime();

    if (currentNumber !== noGoNumber) {
        goTrials++;
    } else {
        noGoTrials++;
    }

    // Set timeout untuk mengubah angka menjadi titik (●)
    timeoutId1 = setTimeout(() => {
        document.getElementById('number-display').textContent = '●';
    }, numberToDotDuration);

    // Set timeout untuk pindah ke angka berikutnya jika user tidak merespons
    timeoutId2 = setTimeout(() => {
        allowResponse = false;
        if (!userResponded) {
            if (currentNumber !== noGoNumber) {
                goMistakes++;
                responses.push({ number: currentNumber, responseTime: null, correct: false });
                document.getElementById('feedback').textContent = '❌ Incorrect! You missed the response.';

                timeoutId2 = setTimeout(() => {
                    trialCount++;
                    displayNumber();
                }, incorrectDelayDuration);
            } else {
                responses.push({ number: currentNumber, responseTime: null, correct: true });
                trialCount++;
                displayNumber();
            }
        }
    }, numberToDotDuration + delayBeforeNextNumber);
}

// Fungsi untuk menangani respons user
function checkResponse(number) {
    if (!allowResponse || userResponded) return;
    userResponded = true;
    allowResponse = false;

    // Hentikan semua timeout yang masih berjalan
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    let responseTime = new Date().getTime() - startTime;
    let timestamp = getLocalTimestamp(); // Gunakan format waktu Indonesia (UTC+7)

    // Ubah angka menjadi titik (●) segera setelah user merespons
    document.getElementById('number-display').textContent = '●';

    if (number !== noGoNumber) {
        document.getElementById('feedback').textContent = '✅';
        responses.push({ number, responseTime, correct: true, timestamp });
    } else {
        noGoMistakes++;
        document.getElementById('feedback').textContent = '❌ Incorrect! You should not have pressed the spacebar.';
        responses.push({ number, responseTime, correct: false, timestamp });

        // Tambahkan delay sebelum menampilkan angka berikutnya
        timeoutId2 = setTimeout(() => {
            trialCount++;
            displayNumber();
        }, incorrectDelayDuration);
    }

    // Hitung waktu sisa agar total durasi trial tetap 1150ms
    let remainingTime = Math.max(0, 1150 - responseTime);

    // Jika respons benar, lanjutkan ke angka berikutnya tanpa delay tambahan
    if (number !== noGoNumber) {
        timeoutId2 = setTimeout(() => {
            trialCount++;
            displayNumber();
        }, remainingTime);
    }
}

// Mendeteksi penekanan tombol spasi dengan benar
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && isExperimentRunning && allowResponse) {
        checkResponse(numberSequence[trialCount]);
    }
});

// Fungsi untuk mengakhiri eksperimen
function endExperiment() {
    document.getElementById('number-display').textContent = '';
    document.getElementById('feedback').textContent = 'Loading Your Test Result...';

    localStorage.setItem('sartResults', JSON.stringify({
        goTrials, goMistakes, noGoTrials, noGoMistakes, responses
    }));

    window.location.href = "results.html";
    isExperimentRunning = false;
}

// Mulai eksperimen
startExperiment();