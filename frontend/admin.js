const API = "http://localhost:8000";

async function loadRecords() {
    const container = document.getElementById("records");
    try {
        const response = await fetch(`${API}/records`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();

        document.getElementById("totalCount").innerText = `Total vectors stored: ${data.total}`;
        container.innerHTML = "";

        if (data.records.length === 0) {
            container.innerHTML = "<p>No records found.</p>";
            return;
        }

        data.records.forEach(record => {
            const div = document.createElement("div");
            div.className = "record-card";
            div.innerHTML = `
                <div class="record-meta">
                    <span>ID: ${record.id}</span>
                    <span>Source: ${record.source}</span>
                    <button class="danger small" onclick="deleteRecord('${record.id}')">Delete</button>
                </div>
                <p class="record-text">${record.text.substring(0, 200)}...</p>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = `<p style="color:red;">Failed to load records: ${err.message}</p>`;
    }
}

async function deleteRecord(id) {
    if (!confirm(`Delete record ${id}?`)) return;
    try {
        const response = await fetch(`${API}/records/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        loadRecords();
    } catch (err) {
        alert(`Delete failed: ${err.message}`);
    }
}

async function resetDB() {
    if (!confirm("Delete ALL data? This cannot be undone.")) return;
    try {
        const response = await fetch(`${API}/reset`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        loadRecords();
    } catch (err) {
        alert(`Reset failed: ${err.message}`);
    }
}

loadRecords();