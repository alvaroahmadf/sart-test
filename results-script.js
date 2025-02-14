document.addEventListener("DOMContentLoaded", function () {
    const storedData = localStorage.getItem("sartResults");

    if (!storedData) {
        document.body.innerHTML = "<h2>No test results found.</h2>";
        return;
    }

    let results;
    try {
        results = JSON.parse(storedData);
    } catch (error) {
        document.body.innerHTML = "<h2>Error loading results.</h2>";
        return;
    }

    if (!results || !results.responses) {
        document.body.innerHTML = "<h2>No test results found.</h2>";
        return;
    }

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

    let resultSaved = false; // Status penyimpanan hasil

    document.getElementById("save-csv").addEventListener("click", function () {
        let fullName = document.getElementById("full-name").value.trim();
        let age = document.getElementById("age").value.trim();
        let gender = document.getElementById("gender").value;

        if (!fullName || !age || !gender) {
            alert("Please fill in all fields before saving.");
            return;
        }

        let csvContent = "Full Name,Age,Gender\n";
        csvContent += `${fullName},${age},${gender}\n\n`;
        csvContent += "Trial #,Timestamp,Number Shown,Response Time (ms),Correct?\n";

        responses.forEach((response, index) => {
            let responseTime = response.responseTime ? response.responseTime : "No Response";
            let correct = response.correct ? "✔ Correct" : "✖ Incorrect";
            csvContent += `${index + 1},${response.timestamp},${response.number},${responseTime},${correct}\n`;
        });

        let blob = new Blob([csvContent], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fullName}_TestResult.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Tandai hasil telah disimpan dan sembunyikan warning
        resultSaved = true;
        document.getElementById("save-warning").style.display = "none";
    });

    // Peringatan sebelum meninggalkan halaman
    window.addEventListener("beforeunload", function (event) {
        if (!resultSaved) {
            event.preventDefault();
            event.returnValue = "You haven't saved your test result yet. Are you sure you want to leave?";
        } else {
            localStorage.removeItem("sartResults"); // Hapus data hanya jika hasil sudah disimpan
        }
    });

    // Set status penyimpanan hasil ke false saat halaman dimuat
    resultSaved = false; // Pastikan status penyimpanan hasil diatur ke false saat halaman dimuat
});