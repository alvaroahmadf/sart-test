document.addEventListener("DOMContentLoaded", function () {
    // Get test results
    const storedData = localStorage.getItem("sartResults");
    if (!storedData) {
        document.getElementById('thankYouMessage').innerHTML = "<h2>Data test tidak ditemukan</h2>";
        return;
    }

    // Get user data
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
        document.getElementById('thankYouMessage').innerHTML = "<h2>Data peserta tidak ditemukan</h2>";
        return;
    }

    // Generate and download CSV immediately
    generateAndDownloadCSV(userData, JSON.parse(storedData).responses);

    // Set up show results button
    document.getElementById("showResultsLink").addEventListener("click", function() {
        document.getElementById("thankYouMessage").style.display = "none";
        document.getElementById("resultsContainer").style.display = "flex";
        
        // Process and display results
        displayResults(JSON.parse(storedData));
    });
});

function displayResults(results) {
    let { goTrials, goMistakes, noGoTrials, noGoMistakes, responses } = results;
    
    document.getElementById("go-trials").textContent = goTrials || 0;
    document.getElementById("go-mistakes").textContent = goMistakes || 0;
    document.getElementById("go-mistake-percentage").textContent =
        goTrials ? ((goMistakes / goTrials) * 100).toFixed(0) + " %" : "0 %";

    document.getElementById("no-go-trials").textContent = noGoTrials || 0;
    document.getElementById("no-go-mistakes").textContent = noGoMistakes || 0;
    document.getElementById("no-go-mistake-percentage").textContent =
        noGoTrials ? ((noGoMistakes / noGoTrials) * 100).toFixed(0) + " %" : "0 %";

    let tableBody = document.getElementById("responseTableBody");
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