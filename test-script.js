// Check demo mode first
const isDemo = localStorage.getItem('demoMode') === 'true';

// Load settings from localStorage or use defaults
const settings = JSON.parse(localStorage.getItem('testSettings')) || {
    trialsPerSession: isDemo ? 18 : 60,
    noGoCountPerSession: isDemo ? 2 : 6,
    noGoNumber: 3,
    delayBeforeNextNumber: 900,
    numberToDotDuration: 250,
    incorrectDelayDuration: 3000,
    probeCount: 0 // Default probe nonaktif
};

// Konfigurasi Eksperimen
let trialsPerSession = settings.trialsPerSession;
let noGoCountPerSession = settings.noGoCountPerSession;
let noGoNumber = settings.noGoNumber;
let delayBeforeNextNumber = settings.delayBeforeNextNumber;
let numberToDotDuration = settings.numberToDotDuration;
let incorrectDelayDuration = settings.incorrectDelayDuration;
let probeCount = settings.probeCount || 0; // Jumlah probe

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

// Variabel Probe
let probeResponses = [];
let remainingProbes = probeCount;
let probeActive = false;

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

// Fungsi untuk menampilkan probe
function showProbe() {
    if (probeActive || remainingProbes <= 0) return;
    
    probeActive = true;
    allowResponse = false;
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);
    
    const probeModal = document.createElement('div');
    probeModal.id = 'probeModal';
    probeModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    probeModal.innerHTML = `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 10px; text-align: center; max-width: 400px;">
            <h2 style="color: #28a745; margin-bottom: 15px;">Apakah Anda masih fokus?</h2>
            <p style="font-size: 18px; margin-bottom: 20px;">Tekan 1 untuk Ya, 2 untuk Tidak</p>
            <div id="probeResponse" style="margin-top: 20px; color: #ffc107; font-weight: bold; font-size: 20px;"></div>
        </div>
    `;
    
    document.body.appendChild(probeModal);
}

// Fungsi untuk menangani respon probe
function handleProbeResponse(response) {
    const responseText = response === 1 ? 'Ya' : 'Tidak';
    probeResponses.push(response);
    remainingProbes--;
    
    document.getElementById('probeResponse').textContent = `Anda menjawab: ${responseText}`;
    
    setTimeout(() => {
        const probeModal = document.getElementById('probeModal');
        if (probeModal) {
            probeModal.remove();
        }
        probeActive = false;
        allowResponse = true;
        displayNumber(); // Lanjutkan test
    }, 1000);
}

// Event listener untuk probe
document.addEventListener('keydown', (e) => {
    if (!probeActive) return;
    
    if (e.key === '1') {
        handleProbeResponse(1);
        e.preventDefault();
    } else if (e.key === '2') {
        handleProbeResponse(2);
        e.preventDefault();
    }
});

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
    remainingProbes = probeCount;
    probeResponses = [];
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
        // Trigger probe secara random setelah respon
        if (remainingProbes > 0 && Math.random() < (remainingProbes / (trialsPerSession - trialCount))) {
            setTimeout(showProbe, 500);
            return; // Skip timeout karena akan dihandle oleh probe
        }

        timeoutId2 = setTimeout(() => {
            trialCount++;
            displayNumber();
        }, remainingTime);
    }
}

// Mendeteksi penekanan tombol spasi
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && isExperimentRunning && allowResponse && !probeActive) {
        checkResponse(numberSequence[trialCount]);
    }
});

// Fungsi untuk mengakhiri eksperimen
function endExperiment() {
    document.getElementById('number-display').textContent = '';
    document.getElementById('feedback').textContent = 'Loading Your Test Result...';

    localStorage.setItem('sartResults', JSON.stringify({
        goTrials, goMistakes, noGoTrials, noGoMistakes, responses,
        probeCount, probeResponses
    }));

    window.location.href = "results.html";
    isExperimentRunning = false;
}

// Mulai eksperimen
startExperiment();