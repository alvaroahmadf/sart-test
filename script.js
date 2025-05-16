let countdownValue = 3;
let countdownInterval;
let isModalOpen = true;

// Default settings
const DEFAULT_SETTINGS = {
    trialsPerSession: 1600,
    noGoCountPerSession: 190,
    noGoNumber: 3,
    delayBeforeNextNumber: 900,
    numberToDotDuration: 250,
    incorrectDelayDuration: 3000,
    probeCount: 0
};

const DEMO_SETTINGS = {
    trialsPerSession: 18,
    noGoCountPerSession: 2,
    noGoNumber: 3,
    delayBeforeNextNumber: 900,
    numberToDotDuration: 250,
    incorrectDelayDuration: 3000,
    probeCount: 4
};

// Initialize settings
function initSettings() {
    if (!localStorage.getItem('userSettings')) {
        localStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS));
    }
}

// Show modal when page loads
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    
    // Load current settings
    const currentSettings = JSON.parse(localStorage.getItem('userSettings')) || DEFAULT_SETTINGS;

    // Populate settings form
    document.getElementById('trialsPerSession').value = currentSettings.trialsPerSession;
    document.getElementById('noGoCountPerSession').value = currentSettings.noGoCountPerSession;
    document.getElementById('noGoNumber').value = currentSettings.noGoNumber;
    document.getElementById('delayBeforeNextNumber').value = currentSettings.delayBeforeNextNumber;
    document.getElementById('numberToDotDuration').value = currentSettings.numberToDotDuration;
    document.getElementById('incorrectDelayDuration').value = currentSettings.incorrectDelayDuration;
    document.getElementById('probeCount').value = currentSettings.probeCount;

    // Show user modal
    setTimeout(() => {
        const modal = document.getElementById('userModal');
        modal.style.display = 'block';
        isModalOpen = true;
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }, 500);

    // Demo button handler
    document.getElementById('demoBtn').addEventListener('click', () => {
        const modal = document.getElementById('userModal');
        modal.classList.remove('show');
        isModalOpen = false;
        
        setTimeout(() => {
            modal.style.display = 'none';
            localStorage.setItem('demoMode', 'true');
            
            document.getElementById('app').innerHTML = `
                <h1>SART Test (Demo)</h1>
                <h2>Instruksi</h2>
                <p>Dalam percobaan ini, Anda akan disajikan dengan angka 1 hingga 9 di bagian tengah layar.</p>
                <p>Tugas Anda adalah menekan SPASI sebagai respons terhadap setiap angka, kecuali bila angka tersebut adalah '3'.</p>
                <p>Setiap angka diikuti oleh lingkaran, yang dapat Anda abaikan.</p>
                
                <h3>Tekan SPASI untuk memulai hitungan mundur.</h3>

                <div class="probe-toggle-container">
                    <label class="probe-toggle-label">Aktifkan Probe:</label>
                    <label class="probe-switch">
                        <input type="checkbox" id="probeToggle" checked>
                        <span class="probe-slider"></span>
                    </label>
                </div>

                <div id="countdown"></div>
                <div id="number-display"></div>
                <div id="feedback"></div>
            `;
            
            document.getElementById('probeToggle').addEventListener('change', function() {
                const updatedSettings = JSON.parse(JSON.stringify(DEMO_SETTINGS));
                updatedSettings.probeCount = this.checked ? 4 : 0;
                localStorage.setItem('demoSettings', JSON.stringify(updatedSettings));
            });
        }, 300);
    });

    // Settings button handler
    document.getElementById('settingsBtn').addEventListener('click', () => {
        const userModal = document.getElementById('userModal');
        userModal.classList.remove('show');
        isModalOpen = false;
        
        setTimeout(() => {
            userModal.style.display = 'none';
            const settingsModal = document.getElementById('settingsModal');
            
            // Load current user settings
            const currentSettings = JSON.parse(localStorage.getItem('userSettings')) || DEFAULT_SETTINGS;
            
            // Populate form
            document.getElementById('trialsPerSession').value = currentSettings.trialsPerSession;
            document.getElementById('noGoCountPerSession').value = currentSettings.noGoCountPerSession;
            document.getElementById('noGoNumber').value = currentSettings.noGoNumber;
            document.getElementById('delayBeforeNextNumber').value = currentSettings.delayBeforeNextNumber;
            document.getElementById('numberToDotDuration').value = currentSettings.numberToDotDuration;
            document.getElementById('incorrectDelayDuration').value = currentSettings.incorrectDelayDuration;
            document.getElementById('probeCount').value = currentSettings.probeCount;
            
            settingsModal.style.display = 'block';
            setTimeout(() => {
                settingsModal.classList.add('show');
            }, 10);
        }, 300);
    });

    // Save settings button handler
    document.getElementById('saveSettings').addEventListener('click', () => {
        const newSettings = {
            trialsPerSession: parseInt(document.getElementById('trialsPerSession').value),
            noGoCountPerSession: parseInt(document.getElementById('noGoCountPerSession').value),
            noGoNumber: parseInt(document.getElementById('noGoNumber').value),
            delayBeforeNextNumber: parseInt(document.getElementById('delayBeforeNextNumber').value),
            numberToDotDuration: parseInt(document.getElementById('numberToDotDuration').value),
            incorrectDelayDuration: parseInt(document.getElementById('incorrectDelayDuration').value),
            probeCount: parseInt(document.getElementById('probeCount').value)
        };
        
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
        alert('Settings saved successfully!');
        
        // Close settings modal
        document.getElementById('settingsModal').classList.remove('show');
        setTimeout(() => {
            document.getElementById('settingsModal').style.display = 'none';
            document.getElementById('userModal').style.display = 'block';
            isModalOpen = true;
            setTimeout(() => {
                document.getElementById('userModal').classList.add('show');
            }, 10);
        }, 300);
    });

    // Back to form button handler
    document.getElementById('backToForm').addEventListener('click', () => {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.remove('show');
        
        setTimeout(() => {
            settingsModal.style.display = 'none';
            const userModal = document.getElementById('userModal');
            userModal.style.display = 'block';
            isModalOpen = true;
            setTimeout(() => {
                userModal.classList.add('show');
            }, 10);
        }, 300);
    });
});

// Handle form submission
document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    isModalOpen = false;
    
    setTimeout(() => {
        modal.style.display = 'none';
        localStorage.setItem('userData', JSON.stringify({
            fullName: document.getElementById('full-name').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value
        }));
        localStorage.setItem('demoMode', 'false');
    }, 300);
});

// Modified spacebar handler
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (isModalOpen) return;
        if (countdownValue === 3) {
            startCountdown();
        }
    }
});

function startCountdown() {
    document.getElementById('app').innerHTML = `
        <div id="countdown"></div>
    `;
    countdownInterval = setInterval(() => {
        if (countdownValue > 0) {
            document.getElementById('countdown').textContent = `Bersiap!  \n${countdownValue}`;
            countdownValue--;
        } else {
            clearInterval(countdownInterval);
            window.location.href = 'test.html';
        }
    }, 1000);
}

// Tampilkan toggle probe saat hover demo button
document.getElementById('demoBtn').addEventListener('mouseover', () => {
    document.getElementById('demoProbeContainer').style.display = 'flex';
});

document.getElementById('demoBtn').addEventListener('mouseout', () => {
    if (!document.getElementById('demoProbeContainer').matches(':hover')) {
        document.getElementById('demoProbeContainer').style.display = 'none';
    }
});

document.getElementById('demoProbeContainer').addEventListener('mouseout', () => {
    document.getElementById('demoProbeContainer').style.display = 'none';
});