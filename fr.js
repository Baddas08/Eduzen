// Traductions en français
const fr = {
    // Auth
    login: "Connexion",
    signup: "Inscription",
    logout: "Déconnexion",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPassword: "Mot de passe oublié?",
    signInWithGoogle: "Se connecter avec Google",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Vous avez déjà un compte?",
    dontHaveAccount: "Vous n'avez pas de compte?",
    
    // Profile Setup
    profileSetup: "Configuration du profil",
    fullName: "Nom complet",
    className: "Classe",
    selectLanguage: "Sélectionner la langue",
    uploadPhoto: "Télécharger une photo",
    completeProfile: "Compléter le profil",
    
    // Navigation
    dashboard: "Tableau de bord",
    planner: "Planificateur",
    tasks: "Tâches",
    calendar: "Calendrier",
    resources: "Ressources",
    quiz: "Quiz",
    chat: "Discussion",
    forum: "Forum",
    settings: "Paramètres",
    profile: "Profil",
    
    // Dashboard
    welcome: "Bienvenue",
    todaysTasks: "Tâches d'aujourd'hui",
    upcomingClasses: "Cours à venir",
    recentActivity: "Activité récente",
    progress: "Progression",
    statistics: "Statistiques",
    totalTasks: "Tâches totales",
    completedTasks: "Tâches terminées",
    hoursStudied: "Heures étudiées",
    quizzesTaken: "Quiz effectués",
    
    // Tasks
    addTask: "Ajouter une tâche",
    editTask: "Modifier la tâche",
    deleteTask: "Supprimer la tâche",
    taskTitle: "Titre de la tâche",
    taskDescription: "Description",
    dueDate: "Date limite",
    priority: "Priorité",
    high: "Haute",
    medium: "Moyenne",
    low: "Basse",
    completed: "Terminé",
    pending: "En attente",
    overdue: "En retard",
    
    // Calendar
    addEvent: "Ajouter un événement",
    editEvent: "Modifier l'événement",
    deleteEvent: "Supprimer l'événement",
    eventTitle: "Titre de l'événement",
    eventDescription: "Description",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    location: "Lieu",
    today: "Aujourd'hui",
    
    // Planner
    addCourse: "Ajouter un cours",
    courseName: "Nom du cours",
    teacher: "Professeur",
    day: "Jour",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    
    // Quiz
    startQuiz: "Commencer le quiz",
    nextQuestion: "Question suivante",
    previousQuestion: "Question précédente",
    submitQuiz: "Soumettre le quiz",
    score: "Score",
    correct: "Correct",
    incorrect: "Incorrect",
    timeRemaining: "Temps restant",
    
    // Chat & Forum
    sendMessage: "Envoyer un message",
    typeMessage: "Tapez votre message...",
    newConversation: "Nouvelle conversation",
    onlineUsers: "Utilisateurs en ligne",
    createPost: "Créer un post",
    postTitle: "Titre du post",
    postContent: "Contenu du post",
    reply: "Répondre",
    like: "J'aime",
    share: "Partager",
    
    // Settings
    generalSettings: "Paramètres généraux",
    appearance: "Apparence",
    notifications: "Notifications",
    language: "Langue",
    darkMode: "Mode sombre",
    glassMode: "Mode verre",
    soundEnabled: "Sons activés",
    emailNotifications: "Notifications par email",
    pushNotifications: "Notifications push",
    
    // Notifications
    taskAdded: "Tâche ajoutée avec succès",
    taskUpdated: "Tâche mise à jour",
    taskDeleted: "Tâche supprimée",
    eventAdded: "Événement ajouté",
    eventUpdated: "Événement mis à jour",
    eventDeleted: "Événement supprimé",
    profileUpdated: "Profil mis à jour",
    settingsSaved: "Paramètres enregistrés",
    
    // Reminders
    reminder: "Rappel",
    setReminder: "Définir un rappel",
    reminderTime: "Heure du rappel",
    reminderMessage: "Message du rappel",
    
    // Common
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    warning: "Avertissement",
    info: "Information",
    confirm: "Confirmer",
    close: "Fermer",
    viewAll: "Voir tout",
    noResults: "Aucun résultat",
    
    // Time
    today: "Aujourd'hui",
    tomorrow: "Demain",
    yesterday: "Hier",
    thisWeek: "Cette semaine",
    nextWeek: "Semaine prochaine",
    thisMonth: "Ce mois",
    
    // Profile
    editProfile: "Modifier le profil",
    changePassword: "Changer le mot de passe",
    changePhoto: "Changer la photo",
    accountSettings: "Paramètres du compte",
    deleteAccount: "Supprimer le compte",
    
    // Footer
    about: "À propos",
    help: "Aide",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions",
    
    // Tagline
    tagline: "Organise tes études, calme ton esprit"
};

if (typeof window !== 'undefined') {
    window.translations = window.translations || {};
    window.translations.fr = fr;
}
