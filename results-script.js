document.addEventListener("DOMContentLoaded", function () {
    // Get test results
    const storedData = localStorage.getItem("sartResults");
    if (!storedData) {
        document.getElementById('thankYouMessage').innerHTML = "<h2>Data test tidak ditemukan</h2>";
        return;
    }

    const results = JSON.parse(storedData);
    
    // Check if in demo mode
    const isDemo = localStorage.getItem('demoMode') === 'true';
    
    if (!isDemo) {
        // Get user data only if not in demo mode
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData) {
            document.getElementById('thankYouMessage').innerHTML = "<h2>Data peserta tidak ditemukan</h2>";
            return;
        }

        // Generate and download CSV only if not in demo mode
        generateAndDownloadCSV(userData, results.responses);
    } else {
        // For demo mode, show different thank you message
        document.getElementById('thankYouMessage').innerHTML = `
            <h2>Demo Selesai!</h2>
            <div class="action-links">
                <a href="index.html" class="back-link">Kembali ke Halaman Awal</a>
                <span id="showResultsLink" class="show-results-link">Perlihatkan Hasil Tes Demo</span>
            </div>
        `;
    }

    // Set up show results button
    document.getElementById("showResultsLink")?.addEventListener("click", function() {
        document.getElementById("thankYouMessage").style.display = "none";
        document.getElementById("resultsContainer").style.display = "flex";
        
        // Process and display results
        displayResults(results);
    });
});

function displayResults(results) {
    let { goTrials, goMistakes, noGoTrials, noGoMistakes, responses, probeCount, probeResponses } = results;
    
    document.getElementById("go-trials").textContent = goTrials || 0;
    document.getElementById("go-mistakes").textContent = goMistakes || 0;
    document.getElementById("go-mistake-percentage").textContent =
        goTrials ? ((goMistakes / goTrials) * 100).toFixed(0) + " %" : "0 %";

    document.getElementById("no-go-trials").textContent = noGoTrials || 0;
    document.getElementById("no-go-mistakes").textContent = noGoMistakes || 0;
    document.getElementById("no-go-mistake-percentage").textContent =
        noGoTrials ? ((noGoMistakes / noGoTrials) * 100).toFixed(0) + " %" : "0 %";

    // Create results section container
    const resultsSection = document.querySelector('.results-section');
    
    // Add probe results if they exist
    if (probeCount > 0 && probeResponses) {
        const yesCount = probeResponses.filter(r => r === 1).length;
        const noCount = probeResponses.filter(r => r === 2).length;
        
        const probeHTML = `
            <div class="probe-results">
                <p><strong>Number of Probe:</strong> ${probeCount}</p>
                <p><strong>Number of Yes Probe:</strong> ${yesCount}</p>
                <p><strong>Number of No Probe:</strong> ${noCount}</p>
            </div>
        `;
        
        // Insert probe results before the back button
        const backButton = resultsSection.querySelector('.back-link');
        if (backButton) {
            backButton.insertAdjacentHTML('beforebegin', probeHTML);
        } else {
            resultsSection.insertAdjacentHTML('beforeend', probeHTML);
        }
    }

    // Populate response table
    let tableBody = document.getElementById("responseTableBody");
    tableBody.innerHTML = ""; // Clear existing rows
    responses.forEach((response, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${response.timestamp ? response.timestamp : "-"}</td>
            <td>${response.number}</td>
            <td class="${response.responseTime ? 'correct' : 'incorrect'}">
                ${response.responseTime ? response.responseTime + " ms" : "No Response"}
            </td>
            <td class="${response.correct ? 'correct' : 'incorrect'}">
                ${response.correct ? "✔ Correct" : "✖ Incorrect"}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateAndDownloadCSV(userData, responses) {
    // Skip CSV generation in demo mode
    if (localStorage.getItem('demoMode') === 'true') {
        return;
    }

    let csvContent = "Data Peserta\n";
    csvContent += `Nama Lengkap,${userData.fullName}\n`;
    csvContent += `Usia,${userData.age}\n`;
    csvContent += `Jenis Kelamin,${userData.gender}\n\n`;
    
    csvContent += "Trial #,Timestamp,Number Shown,Response Time (ms),Correct?\n";
    
    responses.forEach((response, index) => {
        let responseTime = response.responseTime ? response.responseTime : "No Response";
        let correct = response.correct ? "✔ Correct" : "✖ Incorrect";
        csvContent += `${index + 1},${response.timestamp},${response.number},${responseTime},${correct}\n`;
    });

    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${userData.fullName}_SART_Results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
