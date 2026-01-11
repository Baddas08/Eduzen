// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
const installBtn = document.getElementById('install-btn');
const installModal = document.getElementById('install-modal');
const closeInstallModal = document.getElementById('close-install-modal');
const cancelInstall = document.getElementById('cancel-install');
const confirmInstall = document.getElementById('confirm-install');
const languageSelect = document.getElementById('language-select');
const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');
const themeGlass = document.getElementById('theme-glass');
const notificationsToggle = document.getElementById('notifications-toggle');
const soundToggle = document.getElementById('sound-toggle');
const notificationSound = document.getElementById('notification-sound');
const changeProfilePic = document.getElementById('change-profile-pic');
const logoutBtn = document.getElementById('logout-btn');
const messageForm = document.getElementById('message-form');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const addClassBtn = document.getElementById('add-class-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const addClassModal = document.getElementById('add-class-modal');
const addTaskModal = document.getElementById('add-task-modal');
const closeAddClassModal = document.getElementById('close-add-class-modal');
const closeAddTaskModal = document.getElementById('close-add-task-modal');
const cancelClass = document.getElementById('cancel-class');
const cancelTask = document.getElementById('cancel-task');
const classForm = document.getElementById('class-form');
const taskForm = document.getElementById('task-form');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');

// Theme management
let currentTheme = localStorage.getItem('theme') || 'light';
document.body.className = `theme-${currentTheme}`;

// Initialize theme toggle
function updateThemeToggle() {
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

updateThemeToggle();

// Theme switcher
themeToggle.addEventListener('click', () => {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
    } else if (currentTheme === 'dark') {
        currentTheme = 'glass';
    } else {
        currentTheme = 'light';
    }
    
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    
    showNotification('Thème mis à jour');
});

// Theme buttons
themeLight.addEventListener('click', () => {
    currentTheme = 'light';
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    showNotification('Thème clair activé');
});

themeDark.addEventListener('click', () => {
    currentTheme = 'dark';
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    showNotification('Thème sombre activé');
});

themeGlass.addEventListener('click', () => {
    currentTheme = 'glass';
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    showNotification('Thème verre activé');
});

// Menu toggle
menuToggle.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
    overlay.classList.remove('hidden');
});

closeMenu.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    overlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    overlay.classList.add('hidden');
});

// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    // Hide the install button
    installBtn.classList.add('hidden');
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, wait for the user to dismiss the prompt
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
});

// Install modal
installBtn.addEventListener('click', () => {
    installModal.classList.remove('hidden');
});

closeInstallModal.addEventListener('click', () => {
    installModal.classList.add('hidden');
});

cancelInstall.addEventListener('click', () => {
    installModal.classList.add('hidden');
});

confirmInstall.addEventListener('click', () => {
    installModal.classList.add('hidden');
    // In a real app, we would trigger the install here
    showNotification('Application installée !');
});

// Language selector
languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    localStorage.setItem('language', selectedLanguage);
    showNotification(`Langue changée en ${selectedLanguage === 'fr' ? 'Français' : selectedLanguage === 'en' ? 'English' : 'Español'}`);
});

// Notifications toggle - Fixed to properly handle state with color indicators
notificationsToggle.addEventListener('change', () => {
    const enabled = notificationsToggle.checked;
    localStorage.setItem('notificationsEnabled', enabled);
    
    // Update slider position
    const slider = notificationsToggle.nextElementSibling;
    if (enabled) {
        slider.style.transform = 'translateX(26px)';
        slider.style.backgroundColor = '#10b981'; // Green when active
    } else {
        slider.style.transform = 'translateX(4px)';
        slider.style.backgroundColor = '#ef4444'; // Red when inactive
    }
    
    showNotification(enabled ? 'Notifications activées' : 'Notifications désactivées');
});

// Sound toggle - Fixed to properly handle state
soundToggle.addEventListener('change', () => {
    const enabled = soundToggle.checked;
    localStorage.setItem('soundEnabled', enabled);
    
    // Update slider position
    const slider = soundToggle.nextElementSibling;
    if (enabled) {
        slider.style.transform = 'translateX(26px)';
        slider.style.backgroundColor = '#10b981'; // Green when active
    } else {
        slider.style.transform = 'translateX(4px)';
        slider.style.backgroundColor = '#ef4444'; // Red when inactive
    }
    
    showNotification(enabled ? 'Sons activés' : 'Sons désactivés');
});

// Notification sound selection
notificationSound.addEventListener('change', () => {
    const selectedSound = notificationSound.value;
    localStorage.setItem('notificationSound', selectedSound);
    showNotification(`Son de notification changé : ${selectedSound === 'default' ? 'Par défaut' : selectedSound === 'bell' ? 'Cloche' : selectedSound === 'chime' ? 'Carillon' : 'Bip'}`);
});

// Profile picture - Now allows user to select from device gallery
changeProfilePic.addEventListener('click', () => {
    // In a real app, this would open the device gallery
    // For this demo, we'll simulate with prompts
    const name = prompt("Entrez votre nom d'utilisateur:");
    if (name) {
        document.getElementById('user-name').textContent = name;
        localStorage.setItem('userName', name);
        showNotification('Nom d\'utilisateur mis à jour');
    }
    
    const email = prompt("Entrez votre email (facultatif):");
    if (email) {
        document.getElementById('user-email').textContent = email;
        localStorage.setItem('userEmail', email);
        showNotification('Email mis à jour');
    }
    
    // Simulate profile picture selection
    const picUrl = prompt("Entrez l'URL de votre photo de profil (ou laissez vide pour utiliser la valeur par défaut):");
    if (picUrl) {
        document.getElementById('profile-pic').src = picUrl;
        localStorage.setItem('profilePic', picUrl);
        showNotification('Photo de profil mise à jour');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('theme');
    localStorage.removeItem('language');
    localStorage.removeItem('notificationsEnabled');
    localStorage.removeItem('soundEnabled');
    localStorage.removeItem('notificationSound');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    showNotification('Session fermée avec succès');
    
    // Reset to default user info
    document.getElementById('user-name').textContent = 'Utilisateur';
    document.getElementById('user-email').textContent = 'Étudiant StudyZen';
    
    // Reset profile pic
    document.getElementById('profile-pic').src = 'https://placehold.co/100x100?text=👤';
    
    // Redirect to welcome section
    document.getElementById('welcome-section').classList.remove('hidden');
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'welcome-section') {
            section.classList.add('hidden');
        }
    });
});

// Message form - Now includes sender info
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sender-name').value;
    const email = document.getElementById('sender-email').value;
    const message = e.target.querySelector('textarea').value;
    
    if (message.trim()) {
        // In a real app, this would send to your server
        // For this demo, we'll just show what would be sent
        showNotification(`Message envoyé ! (${name}${email ? ` (${email})` : ''})`);
        e.target.reset();
    }
});

// Start button
startBtn.addEventListener('click', () => {
    // Check if first visit
    if (!localStorage.getItem('firstVisit')) {
        // Set first visit flag
        localStorage.setItem('firstVisit', 'true');
        
        // Show language selection
        const language = prompt("Quelle langue préférez-vous ? (fr/en/es)");
        if (language && ['fr', 'en', 'es'].includes(language)) {
            localStorage.setItem('language', language);
            languageSelect.value = language;
            showNotification('Langue sélectionnée : ' + (language === 'fr' ? 'Français' : language === 'en' ? 'English' : 'Español'));
        }
    }
    
    // Navigate to study planner
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('study-planner').classList.remove('hidden');
});

// Add class modal
addClassBtn.addEventListener('click', () => {
    addClassModal.classList.remove('hidden');
});

closeAddClassModal.addEventListener('click', () => {
    addClassModal.classList.add('hidden');
});

cancelClass.addEventListener('click', () => {
    addClassModal.classList.add('hidden');
});

classForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const className = document.getElementById('class-name').value;
    const day = document.getElementById('class-day').value;
    const startTime = document.getElementById('class-start').value;
    const endTime = document.getElementById('class-end').value;
    const teacher = document.getElementById('class-teacher').value;
    
    if (className && startTime && endTime) {
        // Save to localStorage
        const classData = {
            name: className,
            day: day,
            startTime: startTime,
            endTime: endTime,
            teacher: teacher
        };
        
        // Store in localStorage
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        classes.push(classData);
        localStorage.setItem('classes', JSON.stringify(classes));
        
        // Refresh timetable
        renderTimetable();
        
        // Close modal and reset form
        addClassModal.classList.add('hidden');
        classForm.reset();
        
        showNotification('Cours ajouté avec succès');
    }
});

// Add task modal
addTaskBtn.addEventListener('click', () => {
    addTaskModal.classList.remove('hidden');
});

closeAddTaskModal.addEventListener('click', () => {
    addTaskModal.classList.add('hidden');
});

cancelTask.addEventListener('click', () => {
    addTaskModal.classList.add('hidden');
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    
    if (title) {
        // Save to localStorage
        const taskData = {
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            completed: false
        };
        
        // Store in localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(taskData);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Refresh tasks list
        renderTasks();
        
        // Close modal and reset form
        addTaskModal.classList.add('hidden');
        taskForm.reset();
        
        showNotification('Tâche ajoutée avec succès');
    }
});

// Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // Hide all sections
            document.querySelectorAll('section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show target section
            targetSection.classList.remove('hidden');
            
            // Close sidebar if open
            sidebar.classList.add('hidden');
            overlay.classList.add('hidden');
        }
    });
});

// Show notification
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Disable right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Render timetable
function renderTimetable() {
    const timetableBody = document.getElementById('timetable-body');
    timetableBody.innerHTML = '';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    
    // Get classes from localStorage
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    
    hours.forEach(hour => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="py-3 font-medium">${hour}</td>`;
        
        days.forEach(day => {
            const cell = document.createElement('td');
            cell.className = 'py-3 border-b border-gray-200 dark:border-gray-700';
            
            // Find classes for this time slot
            const dayClasses = classes.filter(cls => cls.day === day && cls.startTime === hour);
            
            if (dayClasses.length > 0) {
                dayClasses.forEach(cls => {
                    const classElement = document.createElement('div');
                    classElement.className = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-2 rounded mb-1 text-sm';
                    classElement.innerHTML = `
                        <div class="font-medium">${cls.name}</div>
                        <div>${cls.teacher || ''}</div>
                    `;
                    cell.appendChild(classElement);
                });
            } else {
                cell.textContent = '-';
            }
            
            row.appendChild(cell);
        });
        
        timetableBody.appendChild(row);
    });
}

// Render tasks
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const allTasks = document.getElementById('all-tasks');
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Clear existing content
    tasksList.innerHTML = '';
    allTasks.innerHTML = '';
    
    // Render in tasks list (sidebar)
    tasks.slice(0, 3).forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'flex items-start';
        taskElement.innerHTML = `
            <input type="checkbox" class="mt-1 mr-3" ${task.completed ? 'checked' : ''}>
            <div>
                <h4 class="font-medium">${task.title}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">${task.dueDate || 'Pas de date'}</p>
            </div>
        `;
        tasksList.appendChild(taskElement);
    });
    
    // Render all tasks
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg';
        taskElement.innerHTML = `
            <input type="checkbox" class="mr-4 h-5 w-5" ${task.completed ? 'checked' : ''}>
            <div class="flex-grow">
                <h4 class="font-medium">${task.title}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">${task.description || 'Aucune description'}</p>
                <div class="flex items-center mt-1">
                    <span class="text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                    } px-2 py-1 rounded mr-2">${task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${task.dueDate || 'Pas de date'}</span>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="text-gray-500 hover:text-blue-500">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-gray-500 hover:text-red-500">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        allTasks.appendChild(taskElement);
    });
}

// Render progress dynamically based on tasks
function renderProgress() {
    const progressContainer = document.getElementById('progress-container');
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Calculate progress for each subject
    const subjects = {};
    
    tasks.forEach(task => {
        // Extract subject from task title (this is simplified logic)
        const subject = task.title.split(' ')[0] || 'Autres';
        if (!subjects[subject]) {
            subjects[subject] = { total: 0, completed: 0 };
        }
        subjects[subject].total++;
        if (task.completed) {
            subjects[subject].completed++;
        }
    });
    
    // Generate progress bars
    progressContainer.innerHTML = '';
    
    Object.keys(subjects).forEach(subject => {
        const subjectData = subjects[subject];
        const progress = subjectData.total > 0 ? Math.round((subjectData.completed / subjectData.total) * 100) : 0;
        
        const progressElement = document.createElement('div');
        progressElement.innerHTML = `
            <div class="flex justify-between mb-1">
                <span>${subject}</span>
                <span>${progress}%</span>
            </div>
            <div class="progress-bar bg-gray-200 dark:bg-gray-700">
                <div class="progress-fill bg-blue-500" style="width: ${progress}%"></div>
            </div>
        `;
        progressContainer.appendChild(progressElement);
    });
    
    // If no tasks, show empty state
    if (Object.keys(subjects).length === 0) {
        progressContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-line text-3xl mb-2"></i>
                <p>Ajoutez des tâches pour voir vos progrès</p>
            </div>
        `;
    }
}

// Initialize from localStorage
window.addEventListener('DOMContentLoaded', () => {
    // Restore theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.className = `theme-${currentTheme}`;
        updateThemeToggle();
    }
    
    // Restore language
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        languageSelect.value = savedLanguage;
    }
    
    // Restore notifications state
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    if (notificationsEnabled !== null) {
        notificationsToggle.checked = notificationsEnabled === 'true';
        // Update slider position
        const slider = notificationsToggle.nextElementSibling;
        if (notificationsEnabled === 'true') {
            slider.style.transform = 'translateX(26px)';
            slider.style.backgroundColor = '#10b981'; // Green when active
        } else {
            slider.style.transform = 'translateX(4px)';
            slider.style.backgroundColor = '#ef4444'; // Red when inactive
        }
    }
    
    // Restore sound state
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled !== null) {
        soundToggle.checked = soundEnabled === 'true';
        // Update slider position
        const slider = soundToggle.nextElementSibling;
        if (soundEnabled === 'true') {
            slider.style.transform = 'translateX(26px)';
            slider.style.backgroundColor = '#10b981'; // Green when active
        } else {
            slider.style.transform = 'translateX(4px)';
            slider.style.backgroundColor = '#ef4444'; // Red when inactive
        }
    }
    
    // Restore notification sound
    const savedSound = localStorage.getItem('notificationSound');
    if (savedSound) {
        notificationSound.value = savedSound;
    }
    
    // Restore user info
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('user-name').textContent = userName;
    }
    
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('user-email').textContent = userEmail;
    }
    
    // Restore profile pic
    const savedProfilePic = localStorage.getItem('profilePic');
    if (savedProfilePic) {
        document.getElementById('profile-pic').src = savedProfilePic;
    }
    
    // Render initial data
    renderTimetable();
    renderTasks();
    renderProgress();
});

// Simulate notifications
setInterval(() => {
    // This would normally check for scheduled notifications
    // For demo purposes, we'll just show one every minute
    if (notificationsToggle.checked) {
        showNotification('Rappel : Révision de chimie dans 10 minutes');
    }
}, 60000);

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(error => {
                console.log('SW registration failed: ', error);
            });
    });
}
