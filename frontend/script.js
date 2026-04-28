const API = "http://localhost:8000";

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const status = document.getElementById("uploadStatus");

    if (!fileInput.files[0]) {
        status.innerText = "Please select a file first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    status.innerText = "Uploading and processing...";

    try {
        const response = await fetch(`${API}/upload`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        status.innerText = data.message;
    } catch (err) {
        status.innerText = `Upload failed: ${err.message}`;
    }
}

async function askQuestion() {
    const question = document.getElementById("question").value.trim();
    const answerDiv = document.getElementById("answer");

    if (!question) {
        answerDiv.innerText = "Please type a question first.";
        return;
    }

    answerDiv.innerText = "Thinking...";

    try {
        const response = await fetch(`${API}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        answerDiv.innerText = data.answer;
    } catch (err) {
        answerDiv.innerText = `Error: ${err.message}`;
    }
}