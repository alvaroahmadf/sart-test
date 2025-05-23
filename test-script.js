// Check demo mode first
const isDemo = localStorage.getItem('demoMode') === 'true';

// Load settings from localStorage or use defaults
const settings = JSON.parse(localStorage.getItem('testSettings')) || {
    trialsPerSession: isDemo ? 16 : 5,
    noGoCountPerSession: isDemo ? 2 : 2,
    noGoNumber: 3,
    delayBeforeNextNumber: 900,
    numberToDotDuration: 250,
    incorrectDelayDuration: 3000,
    probeCount: isDemo ? 4 : 20
};

// Experiment Configuration
let trialsPerSession = settings.trialsPerSession;
const noGoCountPerSession = settings.noGoCountPerSession;
const noGoNumber = settings.noGoNumber;
const delayBeforeNextNumber = settings.delayBeforeNextNumber;
const numberToDotDuration = settings.numberToDotDuration;
const incorrectDelayDuration = settings.incorrectDelayDuration;
const probeCount = settings.probeCount;

// Experiment Variables
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
let isSpacePressed = false;
let probeAppearCount = 0;

// Probe Variables
let probeResponses = [];
let remainingProbes = probeCount;
let probeActive = false;
let probeTimestamps = [];

function getLocalTimestamp() {
    const now = new Date();
    const options = { timeZone: "Asia/Jakarta" };
    const localeString = now.toLocaleString('id-ID', options).replace(',', '');
    return localeString + '.' + now.getMilliseconds().toString().padStart(3, "0");
}

function showProbe() {
    if (probeActive || remainingProbes <= 0) return;
    
    probeActive = true;
    probeAppearCount++;
    allowResponse = false;
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    const timestamp = getLocalTimestamp();
    probeTimestamps.push({ type: 'appear', timestamp });
    
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
            <h2 style="color: #28a745; margin-bottom: 15px;">Pernyataan mana yang paling menggambarkan kondisi mental anda sebelum layar ini muncul?</h2>
            <p style="font-size: 18px; margin-bottom: 20px;">Tekan 1: Fokus pada tugas, Tekan 2: Mind Wandering</p>
            <div id="probeResponse" style="margin-top: 20px; color: #ffc107; font-weight: bold; font-size: 20px;"></div>
        </div>
    `;
    
    document.body.appendChild(probeModal);

    responses.push({
        number: 'PROBE',
        responseTime: null,
        correct: null,
        timestamp,
        isProbe: true,
        probeAppearNumber: probeAppearCount
    });
}

function handleProbeResponse(response) {
    const responseText = response === 1 ? 'Fokus' : 'Mind Wandering';
    const timestamp = getLocalTimestamp();
    probeResponses.push({
        response,
        timestamp,
        appearTimestamp: probeTimestamps[probeTimestamps.length - 1].timestamp
    });
    remainingProbes--;
    
    document.getElementById('probeResponse').textContent = `Anda menjawab: ${responseText}`;
    
    setTimeout(() => {
        const probeModal = document.getElementById('probeModal');
        if (probeModal) probeModal.remove();
        probeActive = false;
        displayNumber();
    }, 1000);
}

function startExperiment() {
    document.getElementById('feedback').textContent = '';
    isExperimentRunning = true;
    trialCount = 0;
    responses = [];
    goTrials = 0;
    goMistakes = 0;
    noGoTrials = 0;
    noGoMistakes = 0;
    
    remainingProbes = probeCount; // Menggunakan nilai dari settings
    probeResponses = [];
    probeAppearCount = 0;
    generateNumberSequence();
    displayNumber();
}

function generateNumberSequence() {
    const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== noGoNumber);
    const randomNumbers = [];

    for (let i = 0; i < trialsPerSession - noGoCountPerSession; i++) {
        randomNumbers.push(possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)]);
    }

    for (let i = 0; i < noGoCountPerSession; i++) {
        randomNumbers.push(noGoNumber);
    }

    numberSequence = randomNumbers.sort(() => Math.random() - 0.5);
}

function displayNumber() {
    if (trialCount >= trialsPerSession) {
        endExperiment();
        return;
    }

    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    const currentNumber = numberSequence[trialCount];
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
        document.getElementById('number-display').textContent = '⚪';
    }, numberToDotDuration);

    timeoutId2 = setTimeout(() => {
        allowResponse = false;
        if (!userResponded) {
            if (currentNumber !== noGoNumber) {
                goMistakes++;
                responses.push({ 
                    number: currentNumber, 
                    responseTime: null, 
                    correct: false, 
                    timestamp: getLocalTimestamp() 
                });
                document.getElementById('number-display').textContent = '🔴';
                document.getElementById('feedback').textContent = '❌ Tidak tepat! Anda melewatkan responsnya.';
                
                setTimeout(() => {
                    trialCount++;
                    proceedToNextTrial();
                }, incorrectDelayDuration);
            } else {
                responses.push({ 
                    number: currentNumber, 
                    responseTime: null, 
                    correct: true, 
                    timestamp: getLocalTimestamp() 
                });
                trialCount++;
                proceedToNextTrial();
            }
        }
    }, numberToDotDuration + delayBeforeNextNumber);
}

function proceedToNextTrial() {
    // Show probe every 5 trials in mindwondering mode
    const mindwonderingEnabled = settings.mindwonderingEnabled;
    
    // Show probe if conditions are met
    if (probeCount > 0 && 
        remainingProbes > 0 && 
        trialCount > 0 && 
        (mindwonderingEnabled ? (trialCount % 44 === 0 && trialCount <= (probeCount * 44)) : 
                               (trialCount % Math.floor(trialsPerSession / probeCount) === 0)) && 
        trialCount < trialsPerSession) {
        setTimeout(showProbe, 500);
        return;
    }
    
    // Continue with next trial
    displayNumber();
}



function checkResponse(number) {
    if (!allowResponse || userResponded || probeActive || isSpacePressed) return;
    isSpacePressed = true;
    userResponded = true;
    allowResponse = false;

    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);

    const responseTime = new Date().getTime() - startTime;
    const timestamp = getLocalTimestamp();

    if (number == noGoNumber){
        document.getElementById('number-display').textContent = '🔴';
    } else {
        document.getElementById('number-display').textContent = '🟢';
    }

    if (number !== noGoNumber) {
        document.getElementById('feedback').textContent = '';
        responses.push({ 
            number, 
            responseTime, 
            correct: true, 
            timestamp 
        });
        
        // Tambahkan delay minimal 1150ms sebelum lanjut ke trial berikutnya
        const remainingTime = Math.max(0, (numberToDotDuration + delayBeforeNextNumber) - responseTime);
        setTimeout(() => {
            trialCount++;
            proceedToNextTrial();
        }, remainingTime);
    } else {
        noGoMistakes++;
        document.getElementById('feedback').textContent = '❌ Tidak tepat! Anda seharusnya tidak menekan tombol spasi.';
        responses.push({ 
            number, 
            responseTime, 
            correct: false, 
            timestamp 
        });
        
        setTimeout(() => {
            trialCount++;
            proceedToNextTrial();
        }, incorrectDelayDuration);
    }
}


document.addEventListener('keydown', (e) => {
    if (probeActive) {
        if (e.code === 'Digit1') {
            handleProbeResponse(1);
            e.preventDefault();
        } else if (e.code === 'Digit2') {
            handleProbeResponse(2);
            e.preventDefault();
        }
        return;
    }
    
    if (e.code === 'Space' && isExperimentRunning && !probeActive && !isSpacePressed) {
        checkResponse(numberSequence[trialCount]);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isSpacePressed = false;
    }
});

function endExperiment() {
    document.getElementById('number-display').textContent = '';
    document.getElementById('feedback').textContent = 'Loading Your Test Result...';

    localStorage.setItem('sartResults', JSON.stringify({
        goTrials, 
        goMistakes, 
        noGoTrials, 
        noGoMistakes, 
        responses,
        probeCount, 
        probeResponses,
        probeTimestamps,
        probeAppearCount
    }));

    window.location.href = "results.html";
    isExperimentRunning = false;
}

startExperiment();