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

    // Demo button handler - revisi
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
    }, 300);
});

    // Settings button handler
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
            setTimeout(() => {
                userModal.classList.add('show');
            }, 10);
        }, 300);
    });

    // Save settings button handler
    document.getElementById('saveSettings').addEventListener('click', () => {
        const settings = {
            trialsPerSession: parseInt(document.getElementById('trialsPerSession').value),
            noGoCountPerSession: parseInt(document.getElementById('noGoCountPerSession').value),
            noGoNumber: parseInt(document.getElementById('noGoNumber').value),
            delayBeforeNextNumber: parseInt(document.getElementById('delayBeforeNextNumber').value),
            numberToDotDuration: parseInt(document.getElementById('numberToDotDuration').value),
            incorrectDelayDuration: parseInt(document.getElementById('incorrectDelayDuration').value),
            probeCount: parseInt(document.getElementById('probeCount').value)
        };
        localStorage.setItem('testSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    });
});

// Handle form submission
document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    
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

// Start countdown when space is pressed
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