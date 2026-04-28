const API = "http://localhost:8000";

async function loadFiles() {
    const container = document.getElementById("fileList");
    try {
        const response = await fetch(`${API}/files`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();

        container.innerHTML = "";

        if (data.files.length === 0) {
            container.innerHTML = "<p>No files uploaded yet.</p>";
            return;
        }

        data.files.forEach(file => {
            const div = document.createElement("div");
            div.className = "record-card";
            div.innerHTML = `
                <div class="record-meta">
                    <span>📄 ${file.filename}</span>
                    <span>Chunks: ${file.chunks}</span>
                    <span>Uploaded: ${file.uploaded_at ? file.uploaded_at.split("T")[0] : "Unknown"}</span>
                    <button class="danger small" onclick="deleteFile('${file.filename}')">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = `<p style="color:red;">Failed to load files: ${err.message}</p>`;
    }
}

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
        loadFiles();
    } catch (err) {
        status.innerText = `Upload failed: ${err.message}`;
    }
}

async function deleteFile(filename) {
    if (!confirm(`Delete ${filename} and all its vectors?`)) return;
    try {
        const response = await fetch(`${API}/files/${filename}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        loadFiles();
    } catch (err) {
        alert(`Delete failed: ${err.message}`);
    }
}

loadFiles();