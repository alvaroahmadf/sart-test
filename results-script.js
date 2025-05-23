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
        generateAndDownloadCSV(userData, results);
    } else {
        // For demo mode, show different thank you message
        document.getElementById('thankYouMessage').innerHTML = `
            <h2>Demo Selesai!</h2>
            <div class="action-links">
                <a href="index.html" class="back-link">Kembali ke Halaman Awal</a>
                <span id="showResultsLink" class="show-results-link">_</span>
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
    let { goTrials, goMistakes, noGoTrials, noGoMistakes, responses, probeCount, probeResponses, probeAppearCount } = results;
    
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
    if (probeCount > 0) {
        const focusCount = probeResponses.filter(r => r?.response === 1).length;
        const MWCount = probeResponses.filter(r => r?.response === 2).length;
        const noResponseCount = probeCount - (focusCount + MWCount);
        
        const probeHTML = `
            <div class="probe-results">
                <h3>Probe Summary</h3>
                <p><strong>Total Probe Appeared:</strong> ${probeAppearCount || 0}</p>
                <p><strong>"Focus" Probe:</strong> ${focusCount}</p>
                <p><strong>"MW" Probe:</strong> ${MWCount}</p>

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
    
    // Create separate tables for test trials and probe trials
    const testTrialsTable = document.createElement('tbody');
    const probeTrialsTable = document.createElement('tbody');
    
    let testTrialCount = 0;
    let probeTrialCount = 0;
    
    responses.forEach((response) => {
        if (response.isProbe) {
            // Format row untuk probe
            probeTrialCount++;
            const probeResponse = probeResponses.find(p => p.appearTimestamp === response.timestamp);
            const answer = probeResponse ? (probeResponse.response === 1 ? "Focus" : "Mind Wandering") : "No Response";
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${response.timestamp || "-"}</td>
                <td>PROBE ${probeTrialCount}/${probeCount}</td>
                <td class="${probeResponse ? 'correct' : 'incorrect'}">
                    ${answer}
                </td>
            `;
            probeTrialsTable.appendChild(row);
        } else {
            // Format row untuk test trial
            testTrialCount++;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${testTrialCount}</td>
                <td>${response.timestamp || "-"}</td>
                <td>${response.number}</td>
                <td class="${response.responseTime ? 'correct' : 'incorrect'}">
                    ${response.responseTime ? response.responseTime + " ms" : "No Response"}
                </td>
                <td class="${response.correct ? 'correct' : 'incorrect'}">
                    ${response.correct ? "✔ Correct" : "✖ Incorrect"}
                </td>
            `;
            testTrialsTable.appendChild(row);
        }
    });
    
    // Create tables container
    const tablesContainer = document.createElement('div');
    tablesContainer.className = 'tables-container';
    
    // Create test trials table
    const testTable = document.createElement('div');
    testTable.className = 'table-section';
    testTable.innerHTML = `
        <h2>Test Trials</h2>
        <table>
            <thead>
                <tr>
                    <th>Trial #</th>
                    <th>Timestamp</th>
                    <th>Number Shown</th>
                    <th>Response Time</th>
                    <th>Correct?</th>
                </tr>
            </thead>
        </table>
    `;
    testTable.querySelector('table').appendChild(testTrialsTable);
    
    // Create probe trials table
    const probeTable = document.createElement('div');
    probeTable.className = 'table-section';
    probeTable.innerHTML = `
        <h2>Probe Trials</h2>
        <table>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Probe Shown</th>
                    <th>Answer</th>
                </tr>
            </thead>
        </table>
    `;
    probeTable.querySelector('table').appendChild(probeTrialsTable);
    
    // Add tables to container
    tablesContainer.appendChild(testTable);
    if (probeCount > 0) {
        tablesContainer.appendChild(probeTable);
    }
    
    // Replace existing table section with new tables container
    const oldTableSection = document.querySelector('.table-section');
    oldTableSection.replaceWith(tablesContainer);
}

function generateAndDownloadCSV(userData, results) {
    // Skip CSV generation in demo mode
    if (localStorage.getItem('demoMode') === 'true') {
        return;
    }

    let csvContent = "Data Peserta\n";
    csvContent += `Nama Lengkap,${userData.fullName}\n`;
    csvContent += `Usia,${userData.age}\n`;
    csvContent += `Jenis Kelamin,${userData.gender}\n\n`;
    
    // Test Trials CSV
    csvContent += "TEST TRIALS\n";
    csvContent += "Trial #,Timestamp,Number Shown,Response Time (ms),Correct?\n";
    
    let testTrialCount = 0;
    let probeTrialCount = 0;
    
    results.responses.forEach((response) => {
        if (!response.isProbe) {
            testTrialCount++;
            let responseTime = response.responseTime ? response.responseTime : "No Response";
            let correct = response.correct ? "Correct" : "Incorrect";
            csvContent += `${testTrialCount},${response.timestamp},${response.number},${responseTime},${correct}\n`;
        }
    });
    
    // Probe Trials CSV
    if (results.probeCount > 0) {
        csvContent += "\nPROBE TRIALS\n";
        csvContent += "Timestamp,Probe Shown,Answer\n";
        
        results.responses.forEach((response) => {
            if (response.isProbe) {
                probeTrialCount++;
                const probeResponse = results.probeResponses.find(p => p.appearTimestamp === response.timestamp);
                const answer = probeResponse ? (probeResponse.response === 1 ? "Focus" : "Mind Wandering") : "No Response";
                csvContent += `${response.timestamp},PROBE ${probeTrialCount}/${results.probeCount},${answer}\n`;
            }
        });
    }

    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${userData.fullName}_SART_Results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
