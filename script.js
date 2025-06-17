let countdownValue = 3;
let countdownInterval;

// Show modal when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const modal = document.getElementById('userModal');
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }, 500);

    // Demo button handler
    document.getElementById('demoBtn').addEventListener('click', () => {
        const modal = document.getElementById('userModal');
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            localStorage.setItem('demoMode', 'true');
            
            // Default enable probe in demo mode
            const enableProbe = true;
            
            localStorage.setItem('testSettings', JSON.stringify({
                trialsPerSession: 18,
                noGoCountPerSession: 2,
                noGoNumber: 3,
                delayBeforeNextNumber: 900,
                numberToDotDuration: 250,
                incorrectDelayDuration: 3000,
                probeCount: enableProbe ? 4 : 0
            }));
            
            // Update instructions for demo mode with ALWAYS VISIBLE probe toggle
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
            
            // Add event listener for the probe toggle
            document.getElementById('probeToggle').addEventListener('change', function() {
                const enableProbe = this.checked;
                localStorage.setItem('testSettings', JSON.stringify({
                    trialsPerSession: 18,
                    noGoCountPerSession: 2,
                    noGoNumber: 3,
                    delayBeforeNextNumber: 900,
                    numberToDotDuration: 250,
                    incorrectDelayDuration: 3000,
                    probeCount: enableProbe ? 4 : 0
                }));
            });

            // Set up spacebar listener for demo mode
            document.addEventListener('keydown', handleDemoSpacePress);
        }, 300);
    });

    // Settings button handler (NEW - Added this section)
    document.getElementById('settingsBtn').addEventListener('click', () => {
        const userModal = document.getElementById('userModal');
        userModal.classList.remove('show');
        setTimeout(() => {
            userModal.style.display = 'none';
            const settingsModal = document.getElementById('settingsModal');
            settingsModal.style.display = 'block';
            setTimeout(() => {
                settingsModal.classList.add('show');
            }, 10);
            
            // Load current settings
            const currentSettings = JSON.parse(localStorage.getItem('testSettings')) || {};
            if (currentSettings.mindwonderingEnabled) {
                toggleSettingsLock(true);
            }
        }, 300);
    });

    // Back to form button handler (NEW - Added this section)
    document.getElementById('backToForm').addEventListener('click', () => {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.remove('show');
        setTimeout(() => {
            settingsModal.style.display = 'none';
            const userModal = document.getElementById('userModal');
            userModal.style.display = 'block';
            setTimeout(() => {
                userModal.classList.add('show');
            }, 10);
        }, 300);
    });

    // Function to toggle settings lock
    function toggleSettingsLock(locked) {
        const settingsFields = [
            'trialsPerSession',
            'noGoCountPerSession',
            'noGoNumber',
            'delayBeforeNextNumber',
            'numberToDotDuration',
            'incorrectDelayDuration',
            'probeCount'
        ];
        
        settingsFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.disabled = locked;
                element.style.backgroundColor = locked ? '#555' : '';
                element.style.cursor = locked ? 'not-allowed' : '';
            }
        });
    }

    // Mindwondering toggle change handler
    document.getElementById('mindwonderingToggle').addEventListener('change', function() {
    const isChecked = this.checked;
    toggleSettingsLock(isChecked);
    
    if (isChecked) {
        // Set default values for Mindwondering mode
        document.getElementById('trialsPerSession').value = 905;
        document.getElementById('noGoCountPerSession').value = 100;
        document.getElementById('noGoNumber').value = 3;
        document.getElementById('delayBeforeNextNumber').value = 900;
        document.getElementById('numberToDotDuration').value = 250;
        document.getElementById('incorrectDelayDuration').value = 3000;
        document.getElementById('probeCount').value = Math.floor(905/45); // 20 probes (900/45)
    }

    
});

    // Save settings button handler (NEW - Added this section)
    document.getElementById('saveSettings').addEventListener('click', () => {
        const settings = {
            trialsPerSession: parseInt(document.getElementById('trialsPerSession').value),
            noGoCountPerSession: parseInt(document.getElementById('noGoCountPerSession').value),
            noGoNumber: parseInt(document.getElementById('noGoNumber').value),
            delayBeforeNextNumber: parseInt(document.getElementById('delayBeforeNextNumber').value),
            numberToDotDuration: parseInt(document.getElementById('numberToDotDuration').value),
            incorrectDelayDuration: parseInt(document.getElementById('incorrectDelayDuration').value),
            probeCount: parseInt(document.getElementById('probeCount').value),
            ndwonderingEnabled: document.getElementById('mindwonderingToggle').checked
        };
        localStorage.setItem('testSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    });
});

// Handle form submission
// Di bagian form submission handler, tambahkan penyimpanan default settings
document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    
    // Simpan data user
    localStorage.setItem('userData', JSON.stringify({
        fullName: document.getElementById('full-name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value
    }));
    
    // Reset demo mode dan settings
    localStorage.setItem('demoMode', 'false');
    localStorage.setItem('testSettings', JSON.stringify({
        trialsPerSession: 1600,
        noGoCountPerSession: 190,
        noGoNumber: 3,
        delayBeforeNextNumber: 900,
        numberToDotDuration: 250,
        incorrectDelayDuration: 3000,
        probeCount: 0,
        mindwonderingEnabled: false
    }));
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
});

// Perbaikan event listener untuk spasi
document.addEventListener('keydown', (event) => {
    const userModal = document.getElementById('userModal');
    const settingsModal = document.getElementById('settingsModal');
    
    if (event.code === 'Space' && 
        countdownValue === 3 && 
        getComputedStyle(userModal).display === 'none' && 
        getComputedStyle(settingsModal).display === 'none' &&
        localStorage.getItem('userData') &&
        localStorage.getItem('testSettings')) {
        startCountdown();
    }
});

// Start countdown when space is pressed ONLY if modal is not showing
document.addEventListener('keydown', (event) => {
    const userModal = document.getElementById('userModal');
    const settingsModal = document.getElementById('settingsModal');
    
    if (event.code === 'Space' && 
        countdownValue === 3 && 
        userModal.style.display === 'none' && 
        settingsModal.style.display === 'none' &&
        localStorage.getItem('userData') && // Pastikan userData sudah ada
        localStorage.getItem('demoMode') === 'false') { // Pastikan bukan demo mode
        startCountdown();
    }
});

// Special handler for spacebar in demo mode
function handleDemoSpacePress(event) {
    if (event.code === 'Space' && countdownValue === 3) {
        // Remove this listener to prevent multiple triggers
        document.removeEventListener('keydown', handleDemoSpacePress);
        startCountdown();
    }
}

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
    // Sembunyikan jika tidak sedang hover ke toggle container
    if (!document.getElementById('demoProbeContainer').matches(':hover')) {
        document.getElementById('demoProbeContainer').style.display = 'none';
    }
});

document.getElementById('demoProbeContainer').addEventListener('mouseout', () => {
    document.getElementById('demoProbeContainer').style.display = 'none';
});

window.addEventListener('load', () => {
    if (window.location.pathname.endsWith('index.html')) {
        localStorage.removeItem('demoMode');
        localStorage.removeItem('sartResults');
        // Biarkan testSettings dan userData tetap tersimpan
    }
});
