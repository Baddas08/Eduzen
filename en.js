// English translations
const en = {
    // Auth
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    signInWithGoogle: "Sign in with Google",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    
    // Profile Setup
    profileSetup: "Profile Setup",
    fullName: "Full Name",
    className: "Class",
    selectLanguage: "Select Language",
    uploadPhoto: "Upload Photo",
    completeProfile: "Complete Profile",
    
    // Navigation
    dashboard: "Dashboard",
    planner: "Planner",
    tasks: "Tasks",
    calendar: "Calendar",
    resources: "Resources",
    quiz: "Quiz",
    chat: "Chat",
    forum: "Forum",
    settings: "Settings",
    profile: "Profile",
    
    // Dashboard
    welcome: "Welcome",
    todaysTasks: "Today's Tasks",
    upcomingClasses: "Upcoming Classes",
    recentActivity: "Recent Activity",
    progress: "Progress",
    statistics: "Statistics",
    totalTasks: "Total Tasks",
    completedTasks: "Completed Tasks",
    hoursStudied: "Hours Studied",
    quizzesTaken: "Quizzes Taken",
    
    // Tasks
    addTask: "Add Task",
    editTask: "Edit Task",
    deleteTask: "Delete Task",
    taskTitle: "Task Title",
    taskDescription: "Description",
    dueDate: "Due Date",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    completed: "Completed",
    pending: "Pending",
    overdue: "Overdue",
    
    // Calendar
    addEvent: "Add Event",
    editEvent: "Edit Event",
    deleteEvent: "Delete Event",
    eventTitle: "Event Title",
    eventDescription: "Description",
    startTime: "Start Time",
    endTime: "End Time",
    location: "Location",
    today: "Today",
    
    // Planner
    addCourse: "Add Course",
    courseName: "Course Name",
    teacher: "Teacher",
    day: "Day",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    
    // Quiz
    startQuiz: "Start Quiz",
    nextQuestion: "Next Question",
    previousQuestion: "Previous Question",
    submitQuiz: "Submit Quiz",
    score: "Score",
    correct: "Correct",
    incorrect: "Incorrect",
    timeRemaining: "Time Remaining",
    
    // Chat & Forum
    sendMessage: "Send Message",
    typeMessage: "Type your message...",
    newConversation: "New Conversation",
    onlineUsers: "Online Users",
    createPost: "Create Post",
    postTitle: "Post Title",
    postContent: "Post Content",
    reply: "Reply",
    like: "Like",
    share: "Share",
    
    // Settings
    generalSettings: "General Settings",
    appearance: "Appearance",
    notifications: "Notifications",
    language: "Language",
    darkMode: "Dark Mode",
    glassMode: "Glass Mode",
    soundEnabled: "Sound Enabled",
    emailNotifications: "Email Notifications",
    pushNotifications: "Push Notifications",
    
    // Notifications
    taskAdded: "Task added successfully",
    taskUpdated: "Task updated",
    taskDeleted: "Task deleted",
    eventAdded: "Event added",
    eventUpdated: "Event updated",
    eventDeleted: "Event deleted",
    profileUpdated: "Profile updated",
    settingsSaved: "Settings saved",
    
    // Reminders
    reminder: "Reminder",
    setReminder: "Set Reminder",
    reminderTime: "Reminder Time",
    reminderMessage: "Reminder Message",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    confirm: "Confirm",
    close: "Close",
    viewAll: "View All",
    noResults: "No Results",
    
    // Time
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    nextWeek: "Next Week",
    thisMonth: "This Month",
    
    // Profile
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    changePhoto: "Change Photo",
    accountSettings: "Account Settings",
    deleteAccount: "Delete Account",
    
    // Footer
    about: "About",
    help: "Help",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    
    // Tagline
    tagline: "Organize your studies, calm your spirit"
};

if (typeof window !== 'undefined') {
    window.translations = window.translations || {};
    window.translations.en = en;
}
