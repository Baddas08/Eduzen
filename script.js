// Planner Component
function Planner({ user, t }) {
    const [schedule, setSchedule] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadSchedule();
    }, [user]);

    const loadSchedule = async () => {
        try {
            const scheduleRef = window.dbRef(window.firebaseDatabase, `schedule/${user.uid}`);
            window.onValue(scheduleRef, (snapshot) => {
                if (snapshot.exists()) {
                    const scheduleData = [];
                    snapshot.forEach((childSnapshot) => {
                        scheduleData.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                    setSchedule(scheduleData);
                }
            });
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('planner')}</h1>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    {t('addCourse')}
                </button>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="p-3 text-left border-b dark:border-gray-700">Time</th>
                            {days.map(day => (
                                <th key={day} className="p-3 text-center border-b dark:border-gray-700">
                                    {t(day)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour}>
                                <td className="p-3 border-b dark:border-gray-700 font-medium">{hour}</td>
                                {days.map(day => {
                                    const course = schedule.find(s => s.day === day && s.startTime === hour);
                                    return (
                                        <td key={`${day}-${hour}`} className="p-2 border-b dark:border-gray-700">
                                            {course && (
                                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-sm">
                                                    <div className="font-semibold">{course.courseName}</div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">{course.teacher}</div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Chat Component
function Chat({ user, t }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        loadUsers();
    }, [user]);

    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.uid);
        }
    }, [selectedUser]);

    const loadUsers = async () => {
        try {
            const usersRef = window.dbRef(window.firebaseDatabase, 'users');
            const snapshot = await window.dbGet(usersRef);
            if (snapshot.exists()) {
                const usersData = [];
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.key !== user.uid) {
                        usersData.push({
                            uid: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    }
                });
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadMessages = (otherUserId) => {
        const chatId = [user.uid, otherUserId].sort().join('_');
        const messagesRef = window.dbRef(window.firebaseDatabase, `chats/${chatId}`);
        
        window.onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = [];
                snapshot.forEach((childSnapshot) => {
                    messagesData.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                setMessages(messagesData);
            } else {
                setMessages([]);
            }
        });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        const chatId = [user.uid, selectedUser.uid].sort().join('_');
        const messagesRef = window.dbRef(window.firebaseDatabase, `chats/${chatId}`);
        
        await window.dbPush(messagesRef, {
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            message: newMessage,
            timestamp: new Date().toISOString()
        });

        setNewMessage('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)] fade-in">
            <div className="card md:col-span-1">
                <h2 className="text-xl font-bold mb-4">{t('onlineUsers')}</h2>
                <div className="space-y-2 overflow-y-auto max-h-[600px]">
                    {users.map(u => (
                        <div
                            key={u.uid}
                            onClick={() => setSelectedUser(u)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                selectedUser?.uid === u.uid
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <img src={u.photoURL || 'https://via.placeholder.com/40'} alt={u.displayName} className="avatar avatar-sm" />
                            <div className="flex-1">
                                <div className="font-semibold">{u.displayName}</div>
                                <div className="text-xs text-gray-500">{u.className}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card md:col-span-2 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-700">
                            <img src={selectedUser.photoURL || 'https://via.placeholder.com/40'} alt={selectedUser.displayName} className="avatar avatar-sm" />
                            <div>
                                <div className="font-semibold">{selectedUser.displayName}</div>
                                <div className="text-xs text-gray-500">{selectedUser.className}</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`chat-message ${msg.senderId === user.uid ? 'own' : ''}`}>
                                    <img src={msg.senderPhoto || 'https://via.placeholder.com/40'} alt={msg.senderName} className="chat-message-avatar" />
                                    <div className="chat-message-content">
                                        <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>
                                        <div>{msg.message}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chat-input-container">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder={t('typeMessage')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage} className="btn btn-primary">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <i className="fas fa-comments text-6xl mb-4 opacity-20"></i>
                            <p>{t('newConversation')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Forum Component
function Forum({ user, t }) {
    const [posts, setPosts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [user]);

    const loadPosts = () => {
        const postsRef = window.dbRef(window.firebaseDatabase, 'forum');
        window.onValue(postsRef, (snapshot) => {
            if (snapshot.exists()) {
                const postsData = [];
                snapshot.forEach((childSnapshot) => {
                    postsData.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                setPosts(postsData.reverse());
            }
        });
    };

    const createPost = async (title, content) => {
        const postsRef = window.dbRef(window.firebaseDatabase, 'forum');
        await window.dbPush(postsRef, {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName,
            authorPhoto: user.photoURL,
            likes: 0,
            replies: 0,
            timestamp: new Date().toISOString()
        });
        showNotification(t('success'), 'success');
    };

    const likePost = async (postId, currentLikes) => {
        const postRef = window.dbRef(window.firebaseDatabase, `forum/${postId}`);
        await window.dbUpdate(postRef, { likes: currentLikes + 1 });
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('forum')}</h1>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    {t('createPost')}
                </button>
            </div>

            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="card">
                        <div className="flex items-start gap-4">
                            <img src={post.authorPhoto || 'https://via.placeholder.com/40'} alt={post.authorName} className="avatar avatar-md" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            by {post.authorName} • {new Date(post.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                                <div className="flex gap-4">
                                    <button onClick={() => likePost(post.id, post.likes)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                        <i className="fas fa-thumbs-up"></i>
                                        <span>{post.likes || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                        <i className="fas fa-comment"></i>
                                        <span>{post.replies || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                        <i className="fas fa-share"></i>
                                        <span>{t('share')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <ForumPostModal onClose={() => setShowAddModal(false)} onSave={createPost} t={t} />
            )}
        </div>
    );
}

// Forum Post Modal
function ForumPostModal({ onClose, onSave, t }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(title, content);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-2xl font-bold mb-6">{t('createPost')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('postTitle')}</label>
                        <input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('postContent')}</label>
                        <textarea className="input" rows="6" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary flex-1">{t('save')}</button>
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">{t('cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Resources Component
function Resources({ user, t }) {
    const categories = [
        { name: 'Mathematics', icon: 'fa-calculator', color: 'from-blue-500 to-purple-500' },
        { name: 'Physics', icon: 'fa-atom', color: 'from-green-500 to-teal-500' },
        { name: 'Chemistry', icon: 'fa-flask', color: 'from-orange-500 to-red-500' },
        { name: 'Biology', icon: 'fa-dna', color: 'from-pink-500 to-rose-500' },
        { name: 'Literature', icon: 'fa-book', color: 'from-indigo-500 to-blue-500' },
        { name: 'History', icon: 'fa-landmark', color: 'from-amber-500 to-orange-500' }
    ];

    return (
        <div className="space-y-6 fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('resources')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                    <div key={i} className="card hover:shadow-xl transition-shadow cursor-pointer">
                        <div className={`w-16 h-16 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
                            <i className={`fas ${cat.icon}`}></i>
                        </div>
                        <h3 className="font-bold text-xl mb-2">{cat.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Access study materials, notes, and resources for {cat.name}.
                        </p>
                        <button className="btn btn-secondary w-full">
                            <i className="fas fa-arrow-right mr-2"></i>
                            Browse
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Settings Component
function Settings({ user, t, language, changeLanguage }) {
    const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark-mode'));
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('eduzen_theme', !darkMode ? 'dark' : 'light');
    };

    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
        showNotification(t('settingsSaved'), 'success');
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await window.signOut(window.firebaseAuth);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('settings')}</h1>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">{t('profile')}</h2>
                <div className="flex items-center gap-4 mb-6">
                    <img src={user.photoURL || 'https://via.placeholder.com/100'} alt={user.displayName} className="avatar avatar-lg" />
                    <div>
                        <h3 className="font-bold text-lg">{user.displayName}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.className}</p>
                    </div>
                </div>
                <button className="btn btn-secondary">
                    <i className="fas fa-edit mr-2"></i>
                    {t('editProfile')}
                </button>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">{t('appearance')}</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{t('darkMode')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark mode</p>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                            <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></span>
                            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                        </label>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{t('language')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred language</p>
                        </div>
                        <select className="input w-40" value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">{t('notifications')}</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{t('soundEnabled')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enable notification sounds</p>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input type="checkbox" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} className="sr-only peer" />
                            <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></span>
                            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                        </label>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{t('emailNotifications')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications</p>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} className="sr-only peer" />
                            <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></span>
                            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="card border-2 border-red-200 dark:border-red-900">
                <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
                <button onClick={handleLogout} className="btn w-full" style={{background: 'var(--danger-color)', color: 'white'}}>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    {t('logout')}
                </button>
            </div>
        </div>
    );
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
