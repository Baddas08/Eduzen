// Notifications System
function initializeNotifications() {
    if (!currentUser) return;
    
    const notifRef = window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}`);
    
    window.firebaseImports.onValue(notifRef, (snapshot) => {
        const notifications = snapshot.val();
        updateNotificationBadge(notifications);
    });
    
    // Setup notification button
    document.getElementById('notifBtn')?.addEventListener('click', showNotificationsPanel);
}

function updateNotificationBadge(notifications) {
    const badge = document.getElementById('notifBadge');
    
    if (!notifications) {
        badge.classList.add('hidden');
        return;
    }
    
    const unreadCount = Object.values(notifications).filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function showNotificationsPanel() {
    const notifRef = window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}`);
    
    window.firebaseImports.onValue(notifRef, (snapshot) => {
        const notifications = snapshot.val();
        
        let content = `
            <div class="max-h-96 overflow-y-auto">
        `;
        
        if (!notifications || Object.keys(notifications).length === 0) {
            content += `
                <div class="empty-state py-8">
                    <i class="fas fa-bell-slash text-4xl"></i>
                    <p>${translate('noNotifications')}</p>
                </div>
            `;
        } else {
            const notifArray = Object.entries(notifications)
                .map(([id, notif]) => ({ id, ...notif }))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            notifArray.forEach(notif => {
                const iconClass = {
                    chat: 'fa-message',
                    homework: 'fa-book',
                    forum: 'fa-comments',
                    quiz: 'fa-question-circle',
                    reminder: 'fa-bell'
                }[notif.type] || 'fa-info-circle';
                
                content += `
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 ${notif.read ? 'opacity-60' : 'bg-purple-50 dark:bg-purple-900/20'}">
                        <div class="flex items-start gap-3">
                            <i class="fas ${iconClass} text-purple-600 mt-1"></i>
                            <div class="flex-1">
                                <p class="font-semibold">${notif.fromName || translate('notification')}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${notif.message}</p>
                                <p class="text-xs text-gray-500 mt-1">${formatDate(notif.timestamp)} ${formatTime(notif.timestamp)}</p>
                            </div>
                            ${!notif.read ? `
                                <button onclick="markAsRead('${notif.id}')" class="text-xs text-purple-600 hover:underline">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        content += `
            </div>
            ${notifications && Object.keys(notifications).length > 0 ? `
                <div class="flex gap-2 mt-4">
                    <button onclick="markAllNotificationsAsRead()" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        ${translate('markAllAsRead')}
                    </button>
                    <button onclick="clearAllNotifications()" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        ${translate('clearAll')}
                    </button>
                </div>
            ` : ''}
        `;
        
        createModal(translate('notifications'), content);
    }, { onlyOnce: true });
}

async function markAsRead(notifId) {
    try {
        await window.firebaseImports.update(
            window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}/${notifId}`),
            { read: true }
        );
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllNotificationsAsRead() {
    const notifRef = window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}`);
    
    try {
        const snapshot = await new Promise((resolve) => {
            window.firebaseImports.onValue(notifRef, resolve, { onlyOnce: true });
        });
        
        const notifications = snapshot.val();
        if (!notifications) return;
        
        const updates = {};
        Object.keys(notifications).forEach(id => {
            updates[`${id}/read`] = true;
        });
        
        await window.firebaseImports.update(notifRef, updates);
        closeModal();
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

async function clearAllNotifications() {
    if (!confirm(translate('areYouSure'))) return;
    
    try {
        await window.firebaseImports.remove(
            window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}`)
        );
        closeModal();
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
}

// Homework Reminders
function checkHomeworkReminders() {
    if (!currentUser) return;
    
    const homeworkRef = window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`);
    
    window.firebaseImports.onValue(homeworkRef, (snapshot) => {
        const homework = snapshot.val();
        if (!homework) return;
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        Object.entries(homework).forEach(([id, hw]) => {
            if (hw.completed) return;
            
            const dueDate = new Date(hw.dueDate);
            const timeDiff = dueDate - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            // Reminder 24 hours before
            if (hoursDiff > 0 && hoursDiff <= 24 && !hw.reminder24h) {
                sendHomeworkReminder(id, hw, '24 heures');
                markReminderSent(id, 'reminder24h');
            }
            
            // Reminder 2 hours before
            if (hoursDiff > 0 && hoursDiff <= 2 && !hw.reminder2h) {
                sendHomeworkReminder(id, hw, '2 heures');
                markReminderSent(id, 'reminder2h');
            }
        });
    });
}

async function sendHomeworkReminder(hwId, homework, timeLeft) {
    const notification = {
        type: 'reminder',
        message: `Rappel: ${homework.title} - ${translate('dueDate')} dans ${timeLeft}`,
        timestamp: Date.now(),
        read: false
    };
    
    try {
        const notifRef = window.firebaseImports.push(
            window.firebaseImports.ref(window.db, `notifications/${currentUser.uid}`)
        );
        await window.firebaseImports.set(notifRef, notification);
        
        // Browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Eduzen - Rappel de devoir', {
                body: notification.message,
                icon: 'eduzen.png'
            });
        }
    } catch (error) {
        console.error('Error sending reminder:', error);
    }
}

async function markReminderSent(hwId, reminderType) {
    try {
        await window.firebaseImports.update(
            window.firebaseImports.ref(window.db, `homework/${currentUser.uid}/${hwId}`),
            { [reminderType]: true }
        );
    } catch (error) {
        console.error('Error marking reminder:', error);
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Online/Offline Status
function updateOnlineStatus(online) {
    if (!currentUser) return;
    
    const userStatusRef = window.firebaseImports.ref(window.db, `userStatus/${currentUser.uid}`);
    
    window.firebaseImports.set(userStatusRef, {
        online: online,
        lastSeen: Date.now()
    });
}

window.addEventListener('online', () => updateOnlineStatus(true));
window.addEventListener('offline', () => updateOnlineStatus(false));

// Initialize when user logs in
if (currentUser) {
    updateOnlineStatus(true);
    initializeNotifications();
    requestNotificationPermission();
    
    // Check reminders every 5 minutes
    setInterval(checkHomeworkReminders, 5 * 60 * 1000);
    checkHomeworkReminders(); // Check immediately
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = translate('search');
    searchInput.className = 'px-4 py-2 rounded-lg glass border-0 w-64';
    searchInput.id = 'globalSearch';
    
    searchInput.addEventListener('input', handleSearch);
    
    // Add to navigation
    const navActions = document.querySelector('.top-nav .flex.items-center.space-x-4');
    if (navActions) {
        navActions.insertBefore(searchInput, navActions.firstChild);
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length < 2) return;
    
    // Search in homework
    if (currentPage === 'homework') {
        searchHomework(query);
    }
    
    // Search in forum
    if (currentPage === 'forum') {
        searchForum(query);
    }
}

function searchHomework(query) {
    const items = document.querySelectorAll('.homework-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchForum(query) {
    const posts = document.querySelectorAll('.forum-post');
    posts.forEach(post => {
        const text = post.textContent.toLowerCase();
        if (text.includes(query)) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}

// Export Data
async function exportUserData() {
    if (!currentUser) return;
    
    try {
        const homeworkRef = window.firebaseImports.ref(window.db, `homework/${currentUser.uid}`);
        const scoresRef = window.firebaseImports.ref(window.db, `quizScores/${currentUser.uid}`);
        
        const homeworkSnapshot = await new Promise((resolve) => {
            window.firebaseImports.onValue(homeworkRef, resolve, { onlyOnce: true });
        });
        
        const scoresSnapshot = await new Promise((resolve) => {
            window.firebaseImports.onValue(scoresRef, resolve, { onlyOnce: true });
        });
        
        const data = {
            user: {
                name: currentUser.name,
                email: currentUser.email,
                class: currentUser.class
            },
            homework: homeworkSnapshot.val() || {},
            quizScores: scoresSnapshot.val() || {},
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduzen_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Données exportées avec succès', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification(translate('error'), 'error');
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearch')?.focus();
    }
    
    // Ctrl/Cmd + N for new homework
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentPage === 'homework') {
        e.preventDefault();
        showAddHomeworkModal();
    }
    
    // Ctrl/Cmd + P for new post
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && currentPage === 'forum') {
        e.preventDefault();
        showNewPostModal();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Make functions globally accessible
window.markAsRead = markAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.clearAllNotifications = clearAllNotifications;
window.exportUserData = exportUserData;

// Initialize search when app loads
setTimeout(() => {
    if (document.getElementById('appContainer') && !document.getElementById('appContainer').classList.contains('hidden')) {
        initializeSearch();
    }
}, 2000);
