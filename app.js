// Dashboard Functions
function loadDashboard() {
    if (!currentUser) return;
    
    loadDashboardStats();
    loadUpcomingHomework();
}

async function loadDashboardStats() {
    const homeworkRef = window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`);
    
    window.firebaseImports.onValue(homeworkRef, (snapshot) => {
        const homework = snapshot.val();
        let total = 0;
        let completed = 0;
        let pending = 0;
        
        if (homework) {
            Object.values(homework).forEach(hw => {
                total++;
                if (hw.completed) {
                    completed++;
                } else {
                    pending++;
                }
            });
        }
        
        document.getElementById('homeworkCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;
    });
    
    // Load quiz scores
    const scoresRef = window.firebaseImports.ref(window.db, `quizScores/${currentUser.uid}`);
    window.firebaseImports.onValue(scoresRef, (snapshot) => {
        const scores = snapshot.val();
        let totalScore = 0;
        
        if (scores) {
            Object.values(scores).forEach(score => {
                totalScore += score.score || 0;
            });
        }
        
        document.getElementById('totalScore').textContent = totalScore;
    });
}

function loadUpcomingHomework() {
    const container = document.getElementById('upcomingHomework');
    const homeworkRef = window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`);
    
    window.firebaseImports.onValue(homeworkRef, (snapshot) => {
        const homework = snapshot.val();
        container.innerHTML = '';
        
        if (!homework) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>${translate('noHomework')}</p>
                </div>
            `;
            return;
        }
        
        // Get upcoming homework (not completed, sorted by due date)
        const upcoming = Object.entries(homework)
            .map(([id, hw]) => ({ id, ...hw }))
            .filter(hw => !hw.completed)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
        
        if (upcoming.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>${translate('noHomework')}</p>
                </div>
            `;
            return;
        }
        
        upcoming.forEach(hw => {
            const hwElement = createHomeworkCard(hw, true);
            container.appendChild(hwElement);
        });
    });
}

// Homework Functions
function loadHomework() {
    const container = document.getElementById('homeworkList');
    const homeworkRef = window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`);
    
    window.firebaseImports.onValue(homeworkRef, (snapshot) => {
        const homework = snapshot.val();
        container.innerHTML = '';
        
        if (!homework) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>${translate('noHomework')}</p>
                    <p class="text-sm">${translate('addFirstHomework')}</p>
                </div>
            `;
            return;
        }
        
        const homeworkArray = Object.entries(homework)
            .map(([id, hw]) => ({ id, ...hw }))
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        homeworkArray.forEach(hw => {
            const hwElement = createHomeworkCard(hw, false);
            container.appendChild(hwElement);
        });
    });
}

function createHomeworkCard(hw, compact = false) {
    const div = document.createElement('div');
    div.className = `homework-item glass ${hw.completed ? 'completed' : ''}`;
    
    const daysUntil = Math.ceil((new Date(hw.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isUrgent = daysUntil <= 2 && !hw.completed;
    
    div.innerHTML = `
        <div class="flex-1">
            <h3 class="text-xl font-bold homework-title">${hw.title}</h3>
            <div class="flex gap-2 mt-2">
                <span class="tag ${hw.subject.toLowerCase()}">${translate(hw.subject.toLowerCase())}</span>
                ${isUrgent ? '<span class="badge danger">' + translate('urgent') + '</span>' : ''}
                ${hw.completed ? '<span class="badge success">' + translate('completed') + '</span>' : ''}
            </div>
            <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">${hw.description || ''}</p>
            <p class="text-sm mt-2">
                <i class="fas fa-calendar mr-2"></i>${formatDate(hw.dueDate)}
            </p>
        </div>
        ${!compact ? `
        <div class="flex gap-2">
            ${!hw.completed ? `
            <button onclick="toggleHomeworkComplete('${hw.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <i class="fas fa-check"></i>
            </button>
            ` : ''}
            <button onclick="editHomework('${hw.id}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteHomework('${hw.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        ` : ''}
    `;
    
    return div;
}

function showAddHomeworkModal() {
    const modal = createModal(translate('addHomework'), `
        <form id="homeworkForm" class="space-y-4">
            <div>
                <label class="block mb-2">${translate('title')}</label>
                <input type="text" id="hwTitle" required class="w-full px-4 py-3 rounded-lg glass border-0">
            </div>
            <div>
                <label class="block mb-2">${translate('subject')}</label>
                <select id="hwSubject" required class="w-full px-4 py-3 rounded-lg glass border-0">
                    <option value="math">${translate('math')}</option>
                    <option value="science">${translate('science')}</option>
                    <option value="french">${translate('french')}</option>
                    <option value="english">${translate('english')}</option>
                    <option value="history">${translate('history')}</option>
                    <option value="geography">${translate('geography')}</option>
                    <option value="physics">${translate('physics')}</option>
                    <option value="chemistry">${translate('chemistry')}</option>
                    <option value="other">${translate('other')}</option>
                </select>
            </div>
            <div>
                <label class="block mb-2">${translate('dueDate')}</label>
                <input type="date" id="hwDueDate" required class="w-full px-4 py-3 rounded-lg glass border-0">
            </div>
            <div>
                <label class="block mb-2">${translate('description')}</label>
                <textarea id="hwDescription" rows="3" class="w-full px-4 py-3 rounded-lg glass border-0"></textarea>
            </div>
            <div class="flex gap-4">
                <button type="submit" class="flex-1 gradient-bg text-white py-3 rounded-lg font-semibold">
                    ${translate('save')}
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold">
                    ${translate('cancel')}
                </button>
            </div>
        </form>
    `);
    
    document.getElementById('homeworkForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const homework = {
            title: document.getElementById('hwTitle').value,
            subject: document.getElementById('hwSubject').value,
            dueDate: document.getElementById('hwDueDate').value,
            description: document.getElementById('hwDescription').value,
            completed: false,
            createdAt: Date.now()
        };
        
        try {
            const newHomeworkRef = window.firebaseImports.push(
                window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`)
            );
            await window.firebaseImports.set(newHomeworkRef, homework);
            
            showNotification(translate('homeworkAdded'), 'success');
            closeModal();
        } catch (error) {
            console.error('Error adding homework:', error);
            showNotification(translate('error'), 'error');
        }
    });
}

async function toggleHomeworkComplete(id) {
    try {
        await window.firebaseImports.update(
            window.firebaseImports.ref(window.db, `homework/${currentUser.uid}/${id}`),
            { completed: true }
        );
        showNotification(translate('homeworkCompleted'), 'success');
    } catch (error) {
        console.error('Error completing homework:', error);
        showNotification(translate('error'), 'error');
    }
}

async function deleteHomework(id) {
    if (!confirm(translate('areYouSure'))) return;
    
    try {
        await window.firebaseImports.remove(
            window.firebaseImports.ref(window.db, `homework/${currentUser.uid}/${id}`)
        );
        showNotification(translate('homeworkDeleted'), 'success');
    } catch (error) {
        console.error('Error deleting homework:', error);
        showNotification(translate('error'), 'error');
    }
}

function editHomework(id) {
    // Similar to add homework but with edit mode
    showNotification('Feature coming soon', 'info');
}

// Modal Helper
function createModal(title, content) {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h2 class="text-2xl font-bold mb-6">${title}</h2>
                ${content}
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Make functions globally accessible
window.toggleHomeworkComplete = toggleHomeworkComplete;
window.deleteHomework = deleteHomework;
window.editHomework = editHomework;
window.closeModal = closeModal;
