// Main React Application
const { useState, useEffect, useCallback } = React;

// Main App Component
function EduzenApp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('fr');
    const [notifications, setNotifications] = useState([]);

    // Initialize app
    useEffect(() => {
        // Check for saved theme
        const savedTheme = localStorage.getItem('eduzen_theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }

        // Check for saved language
        const savedLang = localStorage.getItem('eduzen_language') || 'fr';
        setLanguage(savedLang);

        // Listen to auth state
        if (window.firebaseAuth) {
            window.onAuthStateChanged(window.firebaseAuth, async (currentUser) => {
                if (currentUser) {
                    // Check if profile is complete
                    const userRef = window.dbRef(window.firebaseDatabase, `users/${currentUser.uid}`);
                    const snapshot = await window.dbGet(userRef);
                    
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        setUser({ ...currentUser, ...userData });
                        setShowProfileSetup(false);
                    } else {
                        setUser(currentUser);
                        setShowProfileSetup(true);
                    }
                } else {
                    setUser(null);
                    setShowAuthModal(true);
                }
                setLoading(false);
            });

            // Check redirect result for Google Sign-In
            window.getRedirectResult(window.firebaseAuth).then((result) => {
                if (result.user) {
                    console.log('User signed in via redirect');
                }
            }).catch((error) => {
                console.error('Redirect error:', error);
            });
        }

        // Listen for real-time notifications
        if (user) {
            const notifRef = window.dbRef(window.firebaseDatabase, `notifications/${user.uid}`);
            window.onValue(notifRef, (snapshot) => {
                if (snapshot.exists()) {
                    const notifs = Object.values(snapshot.val());
                    setNotifications(notifs);
                }
            });
        }
    }, [user]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('eduzen_theme', !darkMode ? 'dark' : 'light');
    };

    // Change language
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('eduzen_language', lang);
    };

    // Get translation
    const t = (key) => {
        return window.translations?.[language]?.[key] || key;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user || showAuthModal) {
        return <AuthModal onClose={() => setShowAuthModal(false)} t={t} />;
    }

    if (showProfileSetup) {
        return <ProfileSetup user={user} onComplete={() => setShowProfileSetup(false)} t={t} changeLanguage={changeLanguage} />;
    }

    return (
        <div className="app-container">
            <Sidebar 
                user={user}
                currentView={currentView}
                setCurrentView={setCurrentView}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                t={t}
            />
            
            <div className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
                <TopBar 
                    user={user}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    setSidebarOpen={setSidebarOpen}
                    sidebarOpen={sidebarOpen}
                    notifications={notifications}
                    t={t}
                />
                
                <MainContent 
                    currentView={currentView}
                    user={user}
                    t={t}
                    language={language}
                    changeLanguage={changeLanguage}
                />
            </div>
        </div>
    );
}

// Sidebar Component
function Sidebar({ user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, t }) {
    const menuItems = [
        { id: 'dashboard', icon: 'fa-home', label: t('dashboard') },
        { id: 'planner', icon: 'fa-calendar-alt', label: t('planner') },
        { id: 'tasks', icon: 'fa-check-square', label: t('tasks') },
        { id: 'calendar', icon: 'fa-calendar', label: t('calendar') },
        { id: 'quiz', icon: 'fa-question-circle', label: t('quiz') },
        { id: 'chat', icon: 'fa-comments', label: t('chat') },
        { id: 'forum', icon: 'fa-users', label: t('forum') },
        { id: 'resources', icon: 'fa-book', label: t('resources') },
        { id: 'settings', icon: 'fa-cog', label: t('settings') }
    ];

    return (
        <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="eduzen.png" alt="Eduzen" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Eduzen</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('tagline')}</p>
                    </div>
                </div>
            </div>
            
            <nav className="sidebar-menu">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className={`menu-item ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentView(item.id)}
                    >
                        <i className={`fas ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </div>
                ))}
                
                <div className="menu-item" onClick={() => {
                    window.signOut(window.firebaseAuth);
                }}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>{t('logout')}</span>
                </div>
            </nav>
        </aside>
    );
}

// TopBar Component
function TopBar({ user, darkMode, toggleDarkMode, setSidebarOpen, sidebarOpen, notifications, t }) {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="top-bar">
            <div className="flex items-center gap-4 flex-1">
                <button className="icon-btn lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <i className="fas fa-bars"></i>
                </button>
                
                <div className="search-bar">
                    <i className="fas fa-search text-gray-400"></i>
                    <input type="text" placeholder={t('search')} />
                </div>
            </div>
            
            <div className="top-bar-actions">
                <button className="icon-btn" onClick={toggleDarkMode}>
                    <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                
                <div className="relative">
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <i className="fas fa-bell"></i>
                        {notifications.length > 0 && (
                            <span className="badge-count">{notifications.length}</span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50">
                            <h3 className="font-bold mb-3">{t('notifications')}</h3>
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">{t('noResults')}</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {notifications.map((notif, i) => (
                                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3">
                    <img 
                        src={user.photoURL || 'https://via.placeholder.com/40'} 
                        alt={user.displayName || 'User'}
                        className="avatar avatar-sm"
                    />
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm">{user.displayName || user.email}</p>
                        <p className="text-xs text-gray-500">{user.className || t('profile')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Content Component
function MainContent({ currentView, user, t, language, changeLanguage }) {
    switch (currentView) {
        case 'dashboard':
            return <Dashboard user={user} t={t} />;
        case 'planner':
            return <Planner user={user} t={t} />;
        case 'tasks':
            return <Tasks user={user} t={t} />;
        case 'calendar':
            return <Calendar user={user} t={t} />;
        case 'quiz':
            return <Quiz user={user} t={t} language={language} />;
        case 'chat':
            return <Chat user={user} t={t} />;
        case 'forum':
            return <Forum user={user} t={t} />;
        case 'resources':
            return <Resources user={user} t={t} />;
        case 'settings':
            return <Settings user={user} t={t} language={language} changeLanguage={changeLanguage} />;
        default:
            return <Dashboard user={user} t={t} />;
    }
}

// Initialize React App
document.addEventListener('DOMContentLoaded', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<EduzenApp />);
});
