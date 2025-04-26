// Check demo mode first
const isDemo = localStorage.getItem('demoMode') === 'true';

// Load settings from localStorage or use defaults
const settings = JSON.parse(localStorage.getItem('testSettings')) || {
    trialsPerSession: isDemo ? 18 : 60,
    noGoCountPerSession: isDemo ? 2 : 6,
    noGoNumber: 3,
    delayBeforeNextNumber: 900,
    numberToDotDuration: 250,
    incorrectDelayDuration: 3000
};

// Konfigurasi Eksperimen
let trialsPerSession = settings.trialsPerSession;
let noGoCountPerSession = settings.noGoCountPerSession;
let noGoNumber = settings.noGoNumber;
let delayBeforeNextNumber = settings.delayBeforeNextNumber;
let numberToDotDuration = settings.numberToDotDuration;
let incorrectDelayDuration = settings.incorrectDelayDuration;

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
let timeoutId1 = null;
let timeoutId2 = null;

function getLocalTimestamp() {
    let now = new Date();
    let options = { timeZone: "Asia/Jakarta" };
    
    let year = new Intl.DateTimeFormat("id-ID", { year: "numeric", ...options }).format(now);
    let month = new Intl.DateTimeFormat("id-ID", { month: "2-digit", ...options }).format(now);
    let day = new Intl.DateTimeFormat("id-ID", { day: "2-digit", ...options }).format(now);
    let hour = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", hour12: false, ...options }).format(now);
    let minute = new Intl.DateTimeFormat("id-ID", { minute: "2-digit", ...options }).format(now);
    let second = new Intl.DateTimeFormat("id-ID", { second: "2-digit", ...options }).format(now);
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

    timeoutId1 = setTimeout(() => {
        document.getElementById('number-display').textContent = '●';
    }, numberToDotDuration);

    timeoutId2 = setTimeout(() => {
        allowResponse = false;
        if (!userResponded) {
            if (currentNumber !== noGoNumber) {
                goMistakes++;
                responses.push({ number: currentNumber, responseTime: null, correct: false, timestamp: getLocalTimestamp() });
                document.getElementById('feedback').textContent = '❌ Incorrect! You missed the response.';

                timeoutId2 = setTimeout(() => {
                    trialCount++;
                    displayNumber();
                }, incorrectDelayDuration);
            } else {
                responses.push({ number: currentNumber, responseTime: null, correct: true, timestamp: getLocalTimestamp() });
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

    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    let responseTime = new Date().getTime() - startTime;
    let timestamp = getLocalTimestamp();

    document.getElementById('number-display').textContent = '●';

    if (number !== noGoNumber) {
        document.getElementById('feedback').textContent = '✅';
        responses.push({ number, responseTime, correct: true, timestamp });
    } else {
        noGoMistakes++;
        document.getElementById('feedback').textContent = '❌ Incorrect! You should not have pressed the spacebar.';
        responses.push({ number, responseTime, correct: false, timestamp });

        timeoutId2 = setTimeout(() => {
            trialCount++;
            displayNumber();
        }, incorrectDelayDuration);
    }

    let remainingTime = Math.max(0, numberToDotDuration + delayBeforeNextNumber - responseTime);

    if (number !== noGoNumber) {
        timeoutId2 = setTimeout(() => {
            trialCount++;
            displayNumber();
        }, remainingTime);
    }
}

// Mendeteksi penekanan tombol spasi
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