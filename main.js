// Schedule Functions
function loadSchedule() {
    const container = document.getElementById('scheduleContent');
    const scheduleRef = window.firebaseImports.ref(window.db, `schedule/${currentUser.uid}`);
    
    window.firebaseImports.onValue(scheduleRef, (snapshot) => {
        const schedule = snapshot.val();
        
        if (!schedule) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <p>${translate('noSchedule')}</p>
                </div>
            `;
            return;
        }
        
        renderSchedule(schedule, container);
    });
}

function renderSchedule(schedule, container) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    
    let html = '<div class="schedule-grid">';
    
    // Header row
    html += '<div class="schedule-header"></div>';
    days.forEach(day => {
        html += `<div class="schedule-header">${translate(day)}</div>`;
    });
    
    // Time rows
    times.forEach(time => {
        html += `<div class="schedule-time">${time}</div>`;
        days.forEach(day => {
            const classData = schedule[day]?.[time];
            if (classData) {
                html += `
                    <div class="schedule-cell has-class">
                        <strong>${classData.subject}</strong><br>
                        <small>${classData.room || ''}</small>
                    </div>
                `;
            } else {
                html += '<div class="schedule-cell"></div>';
            }
        });
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Forum Functions
function loadForum() {
    const container = document.getElementById('forumPosts');
    const postsRef = window.firebaseImports.ref(window.db, 'forumPosts');
    
    window.firebaseImports.onValue(postsRef, (snapshot) => {
        const posts = snapshot.val();
        container.innerHTML = '';
        
        if (!posts) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>${translate('noPostsYet')}</p>
                    <p class="text-sm">${translate('createFirstPost')}</p>
                </div>
            `;
            return;
        }
        
        const postsArray = Object.entries(posts)
            .map(([id, post]) => ({ id, ...post }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        postsArray.forEach(post => {
            const postElement = createForumPost(post);
            container.appendChild(postElement);
        });
    });
}

function createForumPost(post) {
    const div = document.createElement('div');
    div.className = 'forum-post glass';
    
    div.innerHTML = `
        <div class="forum-post-header">
            <img src="${post.authorPhoto || 'https://via.placeholder.com/40'}" alt="${post.authorName}" class="forum-post-avatar">
            <div>
                <strong>${post.authorName}</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">${formatDate(post.timestamp)} ${formatTime(post.timestamp)}</p>
            </div>
        </div>
        <div class="forum-post-content">
            <p>${post.content}</p>
        </div>
        <div class="forum-post-actions">
            <span class="forum-post-action" onclick="likePost('${post.id}')">
                <i class="fas fa-heart"></i>
                <span id="likes-${post.id}">${post.likes || 0}</span>
            </span>
            <span class="forum-post-action" onclick="showComments('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${post.comments ? Object.keys(post.comments).length : 0}</span>
            </span>
            <span class="forum-post-action">
                <i class="fas fa-share"></i>
                ${translate('share')}
            </span>
        </div>
        <div id="comments-${post.id}" class="hidden mt-4"></div>
    `;
    
    return div;
}

function showNewPostModal() {
    const modal = createModal(translate('newPost'), `
        <form id="newPostForm" class="space-y-4">
            <div>
                <label class="block mb-2">${translate('postContent')}</label>
                <textarea id="postContent" rows="5" required class="w-full px-4 py-3 rounded-lg glass border-0"></textarea>
            </div>
            <div class="flex gap-4">
                <button type="submit" class="flex-1 gradient-bg text-white py-3 rounded-lg font-semibold">
                    ${translate('publish')}
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold">
                    ${translate('cancel')}
                </button>
            </div>
        </form>
    `);
    
    document.getElementById('newPostForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const post = {
            content: document.getElementById('postContent').value,
            authorId: currentUser.uid,
            authorName: currentUser.name,
            authorPhoto: currentUser.photoURL,
            timestamp: Date.now(),
            likes: 0
        };
        
        try {
            const newPostRef = window.firebaseImports.push(
                window.firebaseImports.ref(window.db, 'forumPosts')
            );
            await window.firebaseImports.set(newPostRef, post);
            
            showNotification(translate('postCreated'), 'success');
            closeModal();
        } catch (error) {
            console.error('Error creating post:', error);
            showNotification(translate('error'), 'error');
        }
    });
}

async function likePost(postId) {
    const postRef = window.firebaseImports.ref(window.db, `forumPosts/${postId}`);
    
    try {
        const snapshot = await new Promise((resolve) => {
            window.firebaseImports.onValue(postRef, resolve, { onlyOnce: true });
        });
        
        const post = snapshot.val();
        const currentLikes = post.likes || 0;
        
        await window.firebaseImports.update(postRef, {
            likes: currentLikes + 1
        });
        
        document.getElementById(`likes-${postId}`).textContent = currentLikes + 1;
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

function showComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.classList.toggle('hidden');
}

// Chat Functions
let selectedChatUser = null;

function loadChat() {
    loadChatUsers();
}

function loadChatUsers() {
    const container = document.getElementById('chatUserList');
    const usersRef = window.firebaseImports.ref(window.db, 'users');
    
    window.firebaseImports.onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        container.innerHTML = '';
        
        if (!users) return;
        
        Object.entries(users).forEach(([uid, user]) => {
            if (uid !== currentUser.uid) {
                const userElement = createChatUserItem(uid, user);
                container.appendChild(userElement);
            }
        });
    });
}

function createChatUserItem(uid, user) {
    const div = document.createElement('div');
    div.className = `user-item ${selectedChatUser === uid ? 'active' : ''}`;
    div.onclick = () => selectChatUser(uid, user);
    
    div.innerHTML = `
        <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="${user.name}" class="user-avatar">
        <div class="flex-1">
            <strong>${user.name}</strong>
            <p class="text-sm text-gray-600 dark:text-gray-400">${user.class}</p>
        </div>
        <div class="user-status online"></div>
    `;
    
    return div;
}

function selectChatUser(uid, user) {
    selectedChatUser = uid;
    loadChatUsers();
    loadMessages(uid);
}

function loadMessages(uid) {
    const container = document.getElementById('chatMessages');
    const chatId = [currentUser.uid, uid].sort().join('_');
    const messagesRef = window.firebaseImports.ref(window.db, `chats/${chatId}/messages`);
    
    window.firebaseImports.onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        container.innerHTML = '';
        
        if (!messages) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>${translate('noMessages')}</p>
                </div>
            `;
            return;
        }
        
        const messagesArray = Object.entries(messages)
            .map(([id, msg]) => ({ id, ...msg }))
            .sort((a, b) => a.timestamp - b.timestamp);
        
        messagesArray.forEach(msg => {
            const messageElement = createMessageElement(msg);
            container.appendChild(messageElement);
        });
        
        container.scrollTop = container.scrollHeight;
    });
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    const isSent = msg.senderId === currentUser.uid;
    div.className = `chat-message ${isSent ? 'sent' : 'received'}`;
    
    div.innerHTML = `
        <p>${msg.text}</p>
        <small class="text-xs opacity-70">${formatTime(msg.timestamp)}</small>
    `;
    
    return div;
}

async function sendMessage() {
    if (!selectedChatUser) {
        showNotification(translate('selectUser'), 'warning');
        return;
    }
    
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const chatId = [currentUser.uid, selectedChatUser].sort().join('_');
    const message = {
        text: text,
        senderId: currentUser.uid,
        receiverId: selectedChatUser,
        timestamp: Date.now()
    };
    
    try {
        const newMessageRef = window.firebaseImports.push(
            window.firebaseImports.ref(window.db, `chats/${chatId}/messages`)
        );
        await window.firebaseImports.set(newMessageRef, message);
        
        input.value = '';
        
        // Send notification to receiver
        await sendChatNotification(selectedChatUser, text);
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification(translate('error'), 'error');
    }
}

async function sendChatNotification(userId, messageText) {
    const notification = {
        type: 'chat',
        from: currentUser.uid,
        fromName: currentUser.name,
        message: messageText.substring(0, 50),
        timestamp: Date.now(),
        read: false
    };
    
    try {
        const notifRef = window.firebaseImports.push(
            window.firebaseImports.ref(window.db, `notifications/${userId}`)
        );
        await window.firebaseImports.set(notifRef, notification);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Quiz Functions
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];

function loadQuizzes() {
    const container = document.getElementById('quizContent');
    const userClass = currentUser.class;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_math')">
                <i class="fas fa-calculator text-4xl text-purple-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('math')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz de mathématiques</p>
            </div>
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_science')">
                <i class="fas fa-flask text-4xl text-blue-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('science')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz de sciences</p>
            </div>
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_french')">
                <i class="fas fa-book text-4xl text-green-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('french')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz de français</p>
            </div>
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_english')">
                <i class="fas fa-language text-4xl text-yellow-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('english')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz d'anglais</p>
            </div>
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_history')">
                <i class="fas fa-landmark text-4xl text-red-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('history')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz d'histoire</p>
            </div>
            <div class="glass p-6 rounded-lg cursor-pointer hover:scale-105 transition" onclick="startQuiz('${userClass}_geography')">
                <i class="fas fa-globe text-4xl text-teal-600 mb-4"></i>
                <h3 class="text-xl font-bold">${translate('geography')}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Quiz de géographie</p>
            </div>
        </div>
    `;
}

async function startQuiz(quizId) {
    try {
        const response = await fetch(`${quizId}.json`);
        currentQuiz = await response.json();
        currentQuestionIndex = 0;
        userAnswers = [];
        
        renderQuizQuestion();
    } catch (error) {
        console.error('Error loading quiz:', error);
        showNotification('Quiz non disponible pour cette classe', 'error');
    }
}

function renderQuizQuestion() {
    const container = document.getElementById('quizContent');
    const question = currentQuiz.questions[currentQuestionIndex];
    
    container.innerHTML = `
        <div class="quiz-container">
            <div class="glass p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">${currentQuiz.title}</h2>
                    <span class="text-lg">${translate('question')} ${currentQuestionIndex + 1} ${translate('of')} ${currentQuiz.questions.length}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%"></div>
                </div>
            </div>
            
            <div class="quiz-question glass">
                <h3 class="text-xl font-bold mb-6">${question.question}</h3>
                <div class="space-y-3">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectAnswer(${index})">
                            <input type="radio" name="answer" value="${index}" id="option${index}" class="mr-3">
                            <label for="option${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex gap-4 mt-6">
                ${currentQuestionIndex > 0 ? `
                    <button onclick="previousQuestion()" class="px-6 py-3 bg-gray-600 text-white rounded-lg">
                        <i class="fas fa-arrow-left mr-2"></i>${translate('previousQuestion')}
                    </button>
                ` : ''}
                ${currentQuestionIndex < currentQuiz.questions.length - 1 ? `
                    <button onclick="nextQuestion()" class="flex-1 gradient-bg text-white py-3 rounded-lg font-semibold">
                        ${translate('nextQuestion')}<i class="fas fa-arrow-right ml-2"></i>
                    </button>
                ` : `
                    <button onclick="submitQuiz()" class="flex-1 gradient-bg text-white py-3 rounded-lg font-semibold">
                        ${translate('submitQuiz')}<i class="fas fa-check ml-2"></i>
                    </button>
                `}
            </div>
        </div>
    `;
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    document.querySelectorAll('.quiz-option').forEach((opt, i) => {
        opt.classList.remove('selected');
        if (i === index) {
            opt.classList.add('selected');
        }
    });
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuizQuestion();
    }
}

async function submitQuiz() {
    let score = 0;
    currentQuiz.questions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    // Save score
    try {
        const scoreData = {
            quizId: currentQuiz.id,
            score: percentage,
            correctAnswers: score,
            totalQuestions: currentQuiz.questions.length,
            timestamp: Date.now()
        };
        
        const scoreRef = window.firebaseImports.push(
            window.firebaseImports.ref(window.db, `quizScores/${currentUser.uid}`)
        );
        await window.firebaseImports.set(scoreRef, scoreData);
    } catch (error) {
        console.error('Error saving score:', error);
    }
    
    // Show results
    const container = document.getElementById('quizContent');
    container.innerHTML = `
        <div class="quiz-container text-center">
            <div class="glass p-12 rounded-lg">
                <i class="fas fa-trophy text-6xl text-yellow-500 mb-6"></i>
                <h2 class="text-3xl font-bold mb-4">${translate('quizCompleted')}</h2>
                <p class="text-5xl font-bold gradient-text mb-6">${percentage}%</p>
                <p class="text-xl mb-8">${score} ${translate('correctAnswers')} ${translate('of')} ${currentQuiz.questions.length}</p>
                <div class="flex gap-4 justify-center">
                    <button onclick="loadQuizzes()" class="px-8 py-3 gradient-bg text-white rounded-lg font-semibold">
                        <i class="fas fa-arrow-left mr-2"></i>${translate('close')}
                    </button>
                    <button onclick="startQuiz('${currentQuiz.id}')" class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                        <i class="fas fa-redo mr-2"></i>${translate('retry')}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Profile Functions
function loadProfile() {
    const container = document.getElementById('profileDetails');
    
    container.innerHTML = `
        <div class="space-y-4">
            <div>
                <label class="block mb-2 font-semibold">${translate('email')}</label>
                <p class="glass p-3 rounded-lg">${currentUser.email}</p>
            </div>
            <div>
                <label class="block mb-2 font-semibold">${translate('class')}</label>
                <p class="glass p-3 rounded-lg">${currentUser.class}</p>
            </div>
            <div>
                <label class="block mb-2 font-semibold">${translate('language')}</label>
                <p class="glass p-3 rounded-lg">${currentUser.language}</p>
            </div>
        </div>
    `;
}

// Make functions globally accessible
window.likePost = likePost;
window.showComments = showComments;
window.startQuiz = startQuiz;
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitQuiz = submitQuiz;
