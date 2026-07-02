const API_BASE = window.location.origin;
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

let globalSubjects = [];

async function fetchSubjects() {
    const container = document.getElementById('subjects-container');
    const selectDropdown = document.getElementById('subject-select');
    
    try {
        const response = await fetch(`${API_BASE}/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch subjects');
        
        globalSubjects = data;
        container.innerHTML = '';
        selectDropdown.innerHTML = '<option value="">-- Choose a Subject --</option>';

        if (globalSubjects.length === 0) {
            container.innerHTML = '<p style="font-size:0.9rem;">No subjects tracked yet.</p>';
            return;
        }

        globalSubjects.forEach(sub => {
            const block = document.createElement('div');
            block.className = 'subject-block';
            
            let topicsHTML = '';
            if (sub.topics && sub.topics.length > 0) {
                topicsHTML = `<div class="topic-list">`;
                sub.topics.forEach(t => {
                    topicsHTML += `
                        <div class="topic-item">
                            <span>📌 ${t.topicName}</span>
                        </div>
                    `;
                });
                topicsHTML += `</div>`;
            }

            block.innerHTML = `
                <div class="subject-header">
                    <div>
                        <strong id="name-text-${sub._id}">${sub.name}</strong>
                        <button class="btn-text" onclick="editSubjectName('${sub._id}', '${sub.name}')">Rename</button>
                    </div>
                    <button class="btn-danger-text" onclick="triggerDeleteSubject('${sub._id}')">Delete</button>
                </div>
                ${topicsHTML}
                <div class="inline-form">
                    <input type="text" id="topic-input-${sub._id}" placeholder="New topic branch...">
                    <button onclick="addTopicToSubject('${sub._id}')">Add</button>
                </div>
            `;
            container.appendChild(block);

            const opt = document.createElement('option');
            opt.value = sub._id;
            opt.innerText = sub.name;
            selectDropdown.appendChild(opt);
        });

    } catch (err) {
        container.innerHTML = `<p style="color:var(--error); font-size:0.9rem;">${err.message}</p>`;
    }
}

async function editSubjectName(subjectId, oldName) {
    const newName = prompt("Enter new subject name:", oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    try {
        const response = await fetch(`${API_BASE}/subjects/${subjectId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: newName.trim() })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to rename subject');
        }

        await fetchSubjects();
        await fetchSessions();
    } catch (err) {
        alert(err.message);
    }
}

async function addTopicToSubject(subjectId) {
    const inputElement = document.getElementById(`topic-input-${subjectId}`);
    const topicName = inputElement.value.trim();
    
    if (!topicName) return;

    try {
        const response = await fetch(`${API_BASE}/subjects/${subjectId}/topics`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ topicName })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to add topic');
        }

        inputElement.value = '';
        await fetchSubjects();
    } catch (err) {
        alert(err.message);
    }
}

async function triggerDeleteSubject(subjectId) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
        const response = await fetch(`${API_BASE}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete subject');
        }
        await fetchSubjects();
        await fetchSessions();
    } catch (err) {
        alert(err.message);
    }
}

async function fetchSessions() {
    const feed = document.getElementById('sessions-feed');
    
    try {
        const response = await fetch(`${API_BASE}/studysessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');

        feed.innerHTML = '';

        if (data.length === 0) {
            feed.innerHTML = '<p>No study sessions logged yet. Pick a subject and lock in!</p>';
            return;
        }

        data.reverse().forEach(session => {
            const date = new Date(session.createdAt || session.date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const subjectName = session.subjectId && typeof session.subjectId === 'object' 
                ? session.subjectId.name 
                : (globalSubjects.find(s => s._id === session.subjectId)?.name || 'Course Module');

            const item = document.createElement('div');
            item.className = 'session-item';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <span style="font-weight:700; color:var(--text-main);">${subjectName}</span>
                    <div>
                        <span style="font-size:0.85rem; color:var(--text-muted); margin-right:0.5rem;">${date}</span>
                        <button class="btn-danger-text" onclick="triggerDeleteSession('${session._id}')" style="margin:0;">Delete</button>
                    </div>
                </div>
                <p style="margin-bottom:0; font-size:0.9rem; color:var(--text-main);">
                    ⏱️ Duration: <span style="color:var(--accent); font-weight:600;">${session.duration} mins</span>
                    <button class="btn-text" onclick="editSessionDuration('${session._id}', ${session.duration})">Edit Time</button>
                </p>
                ${session.notes ? `<p style="margin-bottom:0; font-size:0.85rem; color:var(--text-muted); font-style:italic; margin-top:0.25rem;">Focus: "${session.notes}"</p>` : ''}
            `;
            feed.appendChild(item);
        });

    } catch (err) {
        feed.innerHTML = `<p style="color:var(--error);">${err.message}</p>`;
    }
}

async function triggerDeleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this study session?')) return;
    try {
        const response = await fetch(`${API_BASE}/studysessions/${sessionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to delete session');
        }
        await fetchSessions();
    } catch (err) {
        alert(err.message);
    }
}

async function editSessionDuration(sessionId, oldDuration) {
    const newDuration = prompt("Enter new duration (minutes):", oldDuration);
    if (!newDuration || isNaN(newDuration) || Number(newDuration) <= 0 || Number(newDuration) === oldDuration) return;

    try {
        const response = await fetch(`${API_BASE}/studysessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ duration: Number(newDuration) })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update session');
        }

        await fetchSessions();
    } catch (err) {
        alert(err.message);
    }
}

async function initDashboard() {
    await fetchSubjects();
    await fetchSessions();
}

document.getElementById('subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subjectFormMsg = document.getElementById('subject-form-msg');
    const name = document.getElementById('subject-name-input').value;

    subjectFormMsg.innerText = '';

    try {
        const response = await fetch(`${API_BASE}/subjects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to create subject');

        subjectFormMsg.style.color = "var(--success)";
        subjectFormMsg.innerText = "Subject created successfully!";
        
        document.getElementById('subject-name-input').value = '';
        await fetchSubjects();

    } catch (err) {
        subjectFormMsg.style.color = "var(--error)";
        subjectFormMsg.innerText = err.message;
    }
});

document.getElementById('session-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formMsg = document.getElementById('form-msg');
    
    const subjectId = document.getElementById('subject-select').value;
    const duration = document.getElementById('duration-input').value;
    const notes = document.getElementById('notes-input').value;

    formMsg.innerText = '';

    try {
        const response = await fetch(`${API_BASE}/studysessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subjectId, duration: Number(duration), notes })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to submit log entry');

        formMsg.style.color = "var(--success)";
        formMsg.innerText = "Session stored successfully!";
        
        document.getElementById('duration-input').value = '';
        document.getElementById('notes-input').value = '';
        
        await fetchSessions();

    } catch (err) {
        formMsg.style.color = "var(--error)";
        formMsg.innerText = err.message;
    }
});

initDashboard();