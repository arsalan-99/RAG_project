const API = "http://localhost:8000";

async function loadFiles() {
    const container = document.getElementById("fileList");
    try {
        const response = await fetch(`${API}/files`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();

        container.innerHTML = "";

        if (data.files.length === 0) {
            container.innerHTML = '<p class="empty-state">No files uploaded yet.</p>';
            return;
        }

        data.files.forEach(file => {
            const div = document.createElement("div");
            div.className = "file-item";
            div.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.filename}</span>
                    <span class="file-meta">${file.chunks} chunks &middot; ${file.uploaded_at ? file.uploaded_at.split("T")[0] : "Unknown date"}</span>
                </div>
                <button class="danger small" onclick="deleteFile('${file.filename}')">Delete</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = `<p class="empty-state" style="color:var(--danger)">Failed to load files: ${err.message}</p>`;
    }
}

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
        loadFiles();
    } catch (err) {
        status.textContent = `Upload failed: ${err.message}`;
        status.className = "status error";
    }
}

async function deleteFile(filename) {
    if (!confirm(`Delete "${filename}" and all its vectors?`)) return;
    try {
        const response = await fetch(`${API}/files/${encodeURIComponent(filename)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        loadFiles();
    } catch (err) {
        alert(`Delete failed: ${err.message}`);
    }
}

loadFiles();