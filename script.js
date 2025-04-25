let countdownValue = 3;
let countdownInterval;

// Show modal when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const modal = document.getElementById('userModal');
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10); // Small timeout untuk trigger transition
    }, 500);
});

// Handle form submission
document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    
    // Tambahkan delay sebelum menyembunyikan modal
    setTimeout(() => {
        modal.style.display = 'none';
        // Simpan data ke localStorage
        localStorage.setItem('userData', JSON.stringify({
            fullName: document.getElementById('full-name').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value
        }));
    }, 300); // Sesuaikan dengan durasi transition
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
            document.getElementById('countdown').textContent = `Get Ready!  \n${countdownValue}`;
            countdownValue--;
        } else {
            clearInterval(countdownInterval);
            window.location.href = 'test.html';
        }
    }, 1000);
}