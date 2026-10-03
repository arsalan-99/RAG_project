const API = "http://localhost:8000";

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const status = document.getElementById("uploadStatus");

    if (!fileInput.files[0]) {
        status.textContent = "Please select a file first.";
        status.className = "status error";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    status.textContent = "Uploading and processing...";
    status.className = "status";

    try {
        const response = await fetch(`${API}/upload`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        status.textContent = data.message;
        status.className = "status success";
    } catch (err) {
        status.textContent = `Upload failed: ${err.message}`;
        status.className = "status error";
    }
}

async function askQuestion() {
    const question = document.getElementById("question").value.trim();
    const answerDiv = document.getElementById("answer");

    if (!question) {
        answerDiv.textContent = "Please type a question first.";
        answerDiv.className = "thinking";
        answerDiv.classList.add("visible");
        return;
    }

    answerDiv.innerHTML = '<span class="thinking">Thinking...</span>';
    answerDiv.className = "visible";

    try {
        const response = await fetch(`${API}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        answerDiv.textContent = data.answer;
    } catch (err) {
        answerDiv.textContent = `Error: ${err.message}`;
    }
}