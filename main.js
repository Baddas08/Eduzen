// Tasks Component
function Tasks({ user, t }) {
    const [tasks, setTasks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTasks();
    }, [user]);

    const loadTasks = async () => {
        try {
            const tasksRef = window.dbRef(window.firebaseDatabase, `tasks/${user.uid}`);
            window.onValue(tasksRef, (snapshot) => {
                if (snapshot.exists()) {
                    const tasksData = [];
                    snapshot.forEach((childSnapshot) => {
                        tasksData.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                    setTasks(tasksData);
                }
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const addTask = async (taskData) => {
        try {
            const tasksRef = window.dbRef(window.firebaseDatabase, `tasks/${user.uid}`);
            await window.dbPush(tasksRef, {
                ...taskData,
                completed: false,
                createdAt: new Date().toISOString()
            });
            showNotification(t('taskAdded'), 'success');
        } catch (error) {
            console.error('Error adding task:', error);
            showNotification(t('error'), 'error');
        }
    };

    const updateTask = async (taskId, taskData) => {
        try {
            const taskRef = window.dbRef(window.firebaseDatabase, `tasks/${user.uid}/${taskId}`);
            await window.dbUpdate(taskRef, taskData);
            showNotification(t('taskUpdated'), 'success');
        } catch (error) {
            console.error('Error updating task:', error);
            showNotification(t('error'), 'error');
        }
    };

    const deleteTask = async (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const taskRef = window.dbRef(window.firebaseDatabase, `tasks/${user.uid}/${taskId}`);
                await window.dbRemove(taskRef);
                showNotification(t('taskDeleted'), 'success');
            } catch (error) {
                console.error('Error deleting task:', error);
                showNotification(t('error'), 'error');
            }
        }
    };

    const toggleTaskComplete = async (task) => {
        await updateTask(task.id, { completed: !task.completed });
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        return true;
    });

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('tasks')}</h1>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    {t('addTask')}
                </button>
            </div>

            <div className="flex gap-2">
                {['all', 'pending', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        {t(f)}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="task-list">
                    {filteredTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t('noResults')}</p>
                    ) : (
                        filteredTasks.map(task => (
                            <div key={task.id} className={`task-item priority-${task.priority}`}>
                                <div 
                                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={() => toggleTaskComplete(task)}
                                >
                                    {task.completed && <i className="fas fa-check text-white text-sm"></i>}
                                </div>
                                <div className="task-content flex-1">
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">
                                        <span><i className="far fa-calendar mr-1"></i>{task.dueDate}</span>
                                        <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                                            {t(task.priority)}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{task.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingTask(task); setShowAddModal(true); }} className="icon-btn">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => deleteTask(task.id)} className="icon-btn text-red-600">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showAddModal && (
                <TaskModal
                    task={editingTask}
                    onClose={() => { setShowAddModal(false); setEditingTask(null); }}
                    onSave={(data) => {
                        if (editingTask) {
                            updateTask(editingTask.id, data);
                        } else {
                            addTask(data);
                        }
                        setShowAddModal(false);
                        setEditingTask(null);
                    }}
                    t={t}
                />
            )}
        </div>
    );
}

// Task Modal Component
function TaskModal({ task, onClose, onSave, t }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description, dueDate, priority });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-2xl font-bold mb-6">{task ? t('editTask') : t('addTask')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('taskTitle')}</label>
                        <input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('taskDescription')}</label>
                        <textarea className="input" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('dueDate')}</label>
                        <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('priority')}</label>
                        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="low">{t('low')}</option>
                            <option value="medium">{t('medium')}</option>
                            <option value="high">{t('high')}</option>
                        </select>
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

// Calendar Component
function Calendar({ user, t }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadEvents();
    }, [user]);

    const loadEvents = async () => {
        try {
            const eventsRef = window.dbRef(window.firebaseDatabase, `events/${user.uid}`);
            window.onValue(eventsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const eventsData = [];
                    snapshot.forEach((childSnapshot) => {
                        eventsData.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                    setEvents(eventsData);
                }
            });
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('calendar')}</h1>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    {t('addEvent')}
                </button>
            </div>

            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={previousMonth} className="icon-btn">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h2 className="text-xl font-bold">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="icon-btn">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-day"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = new Date().getDate() === day && 
                                      new Date().getMonth() === currentDate.getMonth() && 
                                      new Date().getFullYear() === currentDate.getFullYear();
                        const hasEvent = events.some(e => new Date(e.date).getDate() === day);
                        
                        return (
                            <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold mb-4">{t('upcomingClasses')}</h2>
                <div className="space-y-3">
                    {events.slice(0, 5).map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{event.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {event.date} • {event.startTime} - {event.endTime}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Quiz Component
function Quiz({ user, t, language }) {
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadQuizzes();
    }, [language]);

    const loadQuizzes = async () => {
        try {
            const response = await fetch(`quiz_${language}.json`);
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        }
    };

    const startQuiz = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentQuestion(0);
        setAnswers([]);
        setShowResults(false);
        setScore(0);
    };

    const selectAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestion < currentQuiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const submitQuiz = () => {
        let correctAnswers = 0;
        currentQuiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) {
                correctAnswers++;
            }
        });
        setScore((correctAnswers / currentQuiz.questions.length) * 100);
        setShowResults(true);
    };

    if (!currentQuiz) {
        return (
            <div className="space-y-6 fade-in">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('quiz')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz, i) => (
                        <div key={i} className="card hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                                    <i className="fas fa-graduation-cap"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                                    <p className="text-sm text-gray-500">{quiz.subject}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                <span><i className="fas fa-question-circle mr-1"></i>{quiz.questions.length} questions</span>
                                <span><i className="fas fa-clock mr-1"></i>{quiz.duration} min</span>
                            </div>
                            <button onClick={() => startQuiz(quiz)} className="btn btn-primary w-full">
                                {t('startQuiz')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="max-w-2xl mx-auto fade-in">
                <div className="card text-center">
                    <div className="mb-6">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl mb-4">
                            <i className="fas fa-trophy"></i>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{t('score')}</h2>
                        <div className="text-6xl font-bold text-blue-600">{score.toFixed(0)}%</div>
                    </div>
                    <div className="space-y-3 mb-6">
                        {currentQuiz.questions.map((q, i) => (
                            <div key={i} className={`p-4 rounded-lg ${answers[i] === q.correctAnswer ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                <p className="font-semibold mb-2">{q.question}</p>
                                <p className="text-sm">
                                    <span className="font-medium">{t('correct')}:</span> {q.correctAnswer}
                                    {answers[i] !== q.correctAnswer && (
                                        <span className="ml-2">• <span className="font-medium">Your answer:</span> {answers[i]}</span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setCurrentQuiz(null)} className="btn btn-primary">
                        {t('close')}
                    </button>
                </div>
            </div>
        );
    }

    const question = currentQuiz.questions[currentQuestion];

    return (
        <div className="max-w-3xl mx-auto fade-in">
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{currentQuiz.title}</h2>
                    <span className="text-gray-500">
                        {currentQuestion + 1} / {currentQuiz.questions.length}
                    </span>
                </div>
                
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
                    <div className="space-y-3">
                        {question.options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => selectAnswer(option)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                    answers[currentQuestion] === option
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={previousQuestion}
                        disabled={currentQuestion === 0}
                        className="btn btn-secondary"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        {t('previousQuestion')}
                    </button>
                    {currentQuestion === currentQuiz.questions.length - 1 ? (
                        <button onClick={submitQuiz} className="btn btn-primary">
                            {t('submitQuiz')}
                        </button>
                    ) : (
                        <button onClick={nextQuestion} className="btn btn-primary">
                            {t('nextQuestion')}
                            <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
