// API Endpoints and State
const BASE_URL = 'http://localhost:3000/api';
let userToken = localStorage.getItem('userToken') || null;
let socket = null;
let currentUser = null;

// (Google OAuth removed) Handle tokens via standard login flows only.

// DOM Elements
const viewContainer = document.getElementById('view-container');
const messageContainer = document.getElementById('message-container');
const loader = document.getElementById('loader');
const modeToggle = document.getElementById('mode-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const timeText = document.getElementById('time-text');
const languageSelect = document.getElementById('language-select');

// Global state and constants
const TRAIN_BOOKING_FEE = 50;

// Initialize language from localStorage
languageSelect.value = getCurrentLanguage();

// Language change handler
languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    if (userToken) {
        fetchTrains();
    } else {
        renderLoginView();
    }
});

// --- WebSocket Setup ---

function initializeWebSocket() {
    socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        showMessage(t('connectedToLiveUpdates'), 'success');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        showMessage(t('disconnectedFromLiveUpdates'), 'error');
    });

    socket.on('booking-update', (data) => {
        console.log('Booking update received:', data);
        showMessage(t('newBookingMade'), 'success');
        if (userToken) {
            fetchTrains();
        }
    });

    socket.on('train-status-update', (data) => {
        console.log('Train status update:', data);
        showMessage(t('trainInfoUpdated'), 'success');
        if (userToken) {
            fetchTrains();
        }
    });

    socket.on('live-train-data', (trains) => {
        console.log('Live train data received:', trains);
    });

    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        showMessage(error.message, 'error');
    });
}

function disconnectWebSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// --- Utility Functions ---

function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `slide-in p-4 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-3 mb-2 ${
        type === 'error' 
            ? 'bg-red-500 text-white' 
            : type === 'warning'
            ? 'bg-yellow-500 text-white'
            : 'bg-green-500 text-white'
    }`;
    
    const icon = type === 'error' 
        ? '<i class="fas fa-exclamation-circle text-xl"></i>' 
        : type === 'warning'
        ? '<i class="fas fa-exclamation-triangle text-xl"></i>'
        : '<i class="fas fa-check-circle text-xl"></i>';
    
    messageEl.innerHTML = `${icon}<span>${message}</span>`;
    messageContainer.appendChild(messageEl);

    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => messageEl.remove(), 300);
    }, 4000);
}

function showLoader() {
    loader.classList.remove('hidden');
    setTimeout(() => {
        loader.classList.remove('opacity-0');
        loader.classList.add('opacity-100');
    }, 10);
}

function hideLoader() {
    loader.classList.remove('opacity-100');
    loader.classList.add('opacity-0');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 300);
}

// --- View Rendering ---

function renderLoginView() {
    viewContainer.innerHTML = `
        <div class="max-w-md mx-auto">
            <div class="text-center mb-8">
                <i class="fas fa-train text-6xl text-blue-600 mb-4"></i>
                <h2 class="text-3xl font-bold mb-2">${t('login')}</h2>
                <p class="text-gray-600 dark:text-gray-400">${t('welcomeBack')}</p>
            </div>
            
            <!-- Google login removed: use email/password login below -->
            
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">Or continue with email</span>
                </div>
            </div>
            
            <form id="login-form" class="space-y-5">
                <div>
                    <label for="login-email" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>${t('email')}
                    </label>
                    <input 
                        type="email" 
                        id="login-email" 
                        name="email" 
                        class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="your.email@example.com"
                        required>
                </div>
                
                <div>
                    <label for="login-password" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-lock mr-2"></i>${t('password')}
                    </label>
                    <input 
                        type="password" 
                        id="login-password" 
                        name="password" 
                        class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="••••••••"
                        required>
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg">
                    <i class="fas fa-sign-in-alt mr-2"></i>${t('loginButton')}
                </button>
            </form>
            
            <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                ${t('dontHaveAccount')} 
                <a href="#" id="show-register" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    ${t('registerHere')}
                </a>
            </p>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        renderRegisterView();
    });
}

function renderRegisterView() {
    viewContainer.innerHTML = `
        <div class="max-w-md mx-auto">
            <div class="text-center mb-8">
                <i class="fas fa-user-plus text-6xl text-green-600 mb-4"></i>
                <h2 class="text-3xl font-bold mb-2">${t('register')}</h2>
                <p class="text-gray-600 dark:text-gray-400">Create your account to book tickets</p>
            </div>
            
            <!-- Google signup removed: use email/password registration below -->
            
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500"></span>
                </div>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 p-4 mb-6 rounded">
                <p class="text-sm text-blue-800 dark:text-blue-200">
                    <i class="fas fa-info-circle mr-2"></i>
                    <strong>Note:</strong> Your email will be used to send ticket confirmations and booking details.
                </p>
            </div>
            
            <form id="register-form" class="space-y-5">
                <div>
                    <label for="register-email" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>${t('email')} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="email" 
                        id="register-email" 
                        name="email" 
                        class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                        placeholder="your.email@example.com"
                        required>
                    <p class="text-xs text-gray-500 mt-1">We'll send your ticket to this email</p>
                </div>
                
                <div>
                    <label for="register-password" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-lock mr-2"></i>${t('password')} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="password" 
                        id="register-password" 
                        name="password" 
                        class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                        placeholder="••••••••"
                        required>
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg">
                    <i class="fas fa-user-check mr-2"></i>${t('registerButton')}
                </button>
            </form>
            
            <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                ${t('alreadyHaveAccount')} 
                <a href="#" id="show-login" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    ${t('loginHere')}
                </a>
            </p>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        renderLoginView();
    });
}

function renderDashboardView(trains, bookings) {
    // Hero Section
    let heroHtml = `
        <div class="hero-pattern rounded-2xl p-8 mb-8 text-white">
            <div class="text-center">
                <h2 class="text-4xl font-bold mb-2">${t('welcomeBack')}</h2>
                <p class="text-lg opacity-90">Book your journey with confidence</p>
            </div>
        </div>
    `;

    // Stats Cards
    let statsHtml = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="stats-card">
                <div class="stats-card-icon">
                    <i class="fas fa-train"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">${trains.length}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('availableTrains')}</p>
            </div>
            
            <div class="stats-card">
                <div class="stats-card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">${bookings.length}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('myBookings')}</p>
            </div>
            
            <div class="stats-card">
                <div class="stats-card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <i class="fas fa-map-marked-alt"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">80+</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('trainRoutes')}</p>
            </div>
            
            <div class="stats-card">
                <div class="stats-card-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <i class="fas fa-users"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">10K+</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('happyCustomers')}</p>
            </div>
        </div>
    `;

    // Professional Search Section with Location Hierarchy
    let searchHtml = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center">
                <i class="fas fa-search mr-3 text-blue-600"></i>
                Search Trains by Location
            </h3>
            <form id="location-search-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Source State -->
                <div>
                    <label for="from-state" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-map mr-1 text-green-600"></i>From State
                    </label>
                    <select id="from-state" required class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select State</option>
                    </select>
                </div>
                
                <!-- Source City -->
                <div>
                    <label for="from-city" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-city mr-1 text-green-600"></i>From City
                    </label>
                    <select id="from-city" required disabled class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select City</option>
                    </select>
                </div>
                
                <!-- Source Station -->
                <div>
                    <label for="from-station" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-train mr-1 text-green-600"></i>From Station
                    </label>
                    <select id="from-station" required disabled class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select Station</option>
                    </select>
                </div>
                
                <!-- Destination State -->
                <div>
                    <label for="to-state" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-map mr-1 text-red-600"></i>To State
                    </label>
                    <select id="to-state" required class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select State</option>
                    </select>
                </div>
                
                <!-- Destination City -->
                <div>
                    <label for="to-city" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-city mr-1 text-red-600"></i>To City
                    </label>
                    <select id="to-city" required disabled class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select City</option>
                    </select>
                </div>
                
                <!-- Destination Station -->
                <div>
                    <label for="to-station" class="block text-sm font-semibold mb-2">
                        <i class="fas fa-train mr-1 text-red-600"></i>To Station
                    </label>
                    <select id="to-station" required disabled class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select Station</option>
                    </select>
                </div>
                
                <!-- Search Button -->
                <div class="md:col-span-2 lg:col-span-2 flex items-end gap-3">
                    <button type="submit" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md">
                        <i class="fas fa-search mr-2"></i>Search Trains
                    </button>
                    <button type="button" id="reset-search-btn" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md">
                        <i class="fas fa-redo mr-2"></i>Reset
                    </button>
                </div>
            </form>
        </div>
    `;

    // Header with Logout
    let headerHtml = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold flex items-center">
                <i class="fas fa-list mr-3 text-blue-600"></i>
                ${t('availableTrains')}
                <span class="ml-3 text-sm font-normal text-gray-500">(${trains.length} found)</span>
            </h3>
            <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md">
                <i class="fas fa-sign-out-alt mr-2"></i>${t('logout')}
            </button>
        </div>
    `;

    // Train Cards
    let trainListHtml = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">';
    trains.forEach(train => {
        const booking = bookings.find(booking => booking.trainId === train.id);
        const isBooked = !!booking;
        const canBook = !isBooked; // Allow booking always (waiting list if no seats)
        const seatPercentage = (train.availableSeats / train.totalSeats) * 100;
        const seatColor = seatPercentage > 50 ? 'text-green-600' : seatPercentage > 20 ? 'text-yellow-600' : 'text-red-600';
        
        // Determine button text based on booking status
        let buttonText;
        if (isBooked) {
            if (booking.status === 'Waiting') {
                buttonText = 'View Waiting Status';
            } else if (booking.status === 'RAC') {
                buttonText = 'View RAC Status';
            } else {
                buttonText = t('viewBooking');
            }
        } else {
            buttonText = train.availableSeats > 0 ? t('bookNow') : t('soldOut');
        }
        
        trainListHtml += `
            <div class="train-card rounded-xl p-6 shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-xl font-bold text-gray-900 dark:text-white">${train.name}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span class="badge badge-info">${train.trainNumber || 'N/A'}</span>
                            <span class="badge badge-success ml-2">${train.class || 'Economy'}</span>
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-blue-600">₹${train.price || 50}</p>
                        <p class="text-xs text-gray-500">per seat</p>
                    </div>
                </div>
                
                <div class="space-y-3 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-map-marker-alt text-green-600"></i>
                            <span class="font-semibold">${train.fromStation?.name || train.source}</span>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400"></i>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-map-marker-alt text-red-600"></i>
                            <span class="font-semibold">${train.toStation?.name || train.destination}</span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex items-center space-x-2">
                            <i class="far fa-clock text-blue-600"></i>
                            <div>
                                <p class="text-xs text-gray-500">${t('departureTime')}</p>
                                <p class="font-semibold">${train.departureTime || train.time || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-hourglass-half text-purple-600"></i>
                            <div>
                                <p class="text-xs text-gray-500">${t('duration')}</p>
                                <p class="font-semibold">${train.duration || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span class="${seatColor} font-semibold">
                            <i class="fas fa-chair mr-1"></i>
                            ${train.availableSeats}/${train.totalSeats} ${t('availableSeats')}
                        </span>
                        <div class="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style="width: ${seatPercentage}%"></div>
                        </div>
                    </div>
                </div>
                
                <button 
                    data-id="${train.id}" 
                    data-booked="${isBooked}" 
                    class="book-btn w-full py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md ${
                        isBooked 
                            ? booking.status === 'Waiting' 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
                                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
                            : train.availableSeats > 0
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    }">
                    <i class="fas ${
                        isBooked 
                            ? booking.status === 'Waiting' ? 'fa-clock' : 'fa-eye'
                            : train.availableSeats > 0 ? 'fa-ticket-alt' : 'fa-list'
                    } mr-2"></i>
                    ${buttonText}
                </button>
            </div>
        `;
    });
    trainListHtml += '</div>';

    if (trains.length === 0) {
        trainListHtml = `
            <div class="text-center py-12">
                <i class="fas fa-train text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-xl text-gray-500 dark:text-gray-400">No trains available at the moment.</p>
            </div>
        `;
    }

    viewContainer.innerHTML = heroHtml + statsHtml + searchHtml + headerHtml + trainListHtml;

    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const trainId = e.target.closest('button').dataset.id;
            const isBooked = e.target.closest('button').dataset.booked === 'true';
            const train = trains.find(t => t.id == trainId);
            if (isBooked) {
                const booking = bookings.find(b => b.trainId == trainId);
                showBookingModal(booking, train);
            } else {
                showBookingModal(null, train);
            }
        });
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Initialize location search functionality
    initializeLocationSearch();
}

// Helper function to get seat layout configuration
function getSeatLayoutForClass(trainClass) {
    const layouts = {
        'Sleeper': { rows: 12, columns: 8, seatsPerCoach: 72, coaches: ['S1', 'S2', 'S3', 'S4', 'S5'] },
        '3AC': { rows: 12, columns: 6, seatsPerCoach: 64, coaches: ['A1', 'A2', 'A3'] },
        '2AC': { rows: 10, columns: 4, seatsPerCoach: 48, coaches: ['B1', 'B2'] },
        'AC Chair Car': { rows: 10, columns: 5, seatsPerCoach: 78, coaches: ['C1', 'C2', 'C3'] },
        '1AC': { rows: 8, columns: 4, seatsPerCoach: 24, coaches: ['H1'] },
        'Executive Chair': { rows: 7, columns: 4, seatsPerCoach: 44, coaches: ['E1', 'E2'] }
    };
    return layouts[trainClass] || layouts['Sleeper'];
}

function showBookingModal(booking = null, train = null) {
    const modal = document.getElementById('booking-modal');
    const modalContent = document.getElementById('modal-content');

    if (booking && train) {
        const journeyDate = new Date(booking.journeyDate);
        const bookingDate = new Date(booking.createdAt);
        
        modalContent.innerHTML = `
            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 ${
                        booking.status === 'Waiting' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                        booking.status === 'Confirmed' ? 'bg-blue-100 dark:bg-blue-900' : 
                        'bg-gray-100 dark:bg-gray-900'
                    } rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas ${
                            booking.status === 'Waiting' ? 'fa-clock' : 
                            booking.status === 'Confirmed' ? 'fa-ticket-alt' : 
                            'fa-train'
                        } text-3xl ${
                            booking.status === 'Waiting' ? 'text-yellow-600' : 
                            booking.status === 'Confirmed' ? 'text-blue-600' : 
                            'text-gray-600'
                        }"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-2">${
                        booking.status === 'Waiting' ? 'Waiting List Booking' : 
                        booking.status === 'RAC' ? 'RAC Booking' : 
                        t('yourBooking')
                    }</h3>
                    <p class="text-sm text-gray-500">PNR: <span class="font-mono font-bold text-blue-600">${booking.pnrNumber}</span></p>
                    ${booking.status === 'Waiting' && booking.waitingPosition ? `
                        <div class="mt-3 inline-block bg-yellow-100 dark:bg-yellow-800 px-4 py-2 rounded-full">
                            <span class="text-yellow-800 dark:text-yellow-200 font-bold">
                                <i class="fas fa-hourglass-half mr-2"></i>Position: WL${booking.waitingPosition}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="space-y-3 mb-6">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 border-l-4 border-blue-600">
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-bold text-lg">${train.name}</p>
                            <span class="badge badge-info">${train.trainNumber}</span>
                        </div>
                        <p class="text-sm"><span class="badge badge-success">${train.class}</span></p>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-user text-blue-600 mr-2"></i>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Passenger Name</p>
                        </div>
                        <p class="font-bold text-lg">${booking.passengerName}</p>
                        <p class="text-sm text-gray-500 mt-1">Age: ${booking.passengerAge} years</p>
                    </div>
                    
                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4 border-l-4 border-purple-600">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-chair text-purple-600 mr-2"></i>
                            <p class="text-sm font-semibold">Seat Details</p>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Coach</p>
                                <p class="font-bold text-xl">${booking.coachNumber || 'N/A'}</p>
                            </div>
                            <div class="text-center">
                                <i class="fas fa-arrow-right text-gray-400"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Seat No.</p>
                                <p class="font-bold text-xl">${booking.seatNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>
                                <p class="text-xs text-gray-500 dark:text-gray-400">From</p>
                            </div>
                            <p class="font-semibold">${train.fromStation?.name || train.source}</p>
                            <p class="text-xs text-gray-500 mt-1">${train.departureTime}</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-map-marker-alt text-red-600 mr-2"></i>
                                <p class="text-xs text-gray-500 dark:text-gray-400">To</p>
                            </div>
                            <p class="font-semibold">${train.toStation?.name || train.destination}</p>
                            <p class="text-xs text-gray-500 mt-1">${train.arrivalTime}</p>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 border-l-4 border-yellow-600">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-calendar-check text-yellow-600 mr-2"></i>
                            <p class="text-sm font-semibold">Journey Date</p>
                        </div>
                        <p class="font-bold text-lg">${journeyDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p class="text-xs text-gray-500 mt-1">Duration: ${train.duration}</p>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Booking Details</p>
                        </div>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                <span class="badge ${
                                    booking.status === 'Confirmed' ? 'badge-success' : 
                                    booking.status === 'Waiting' ? 'badge-warning' : 
                                    booking.status === 'RAC' ? 'badge-info' : 
                                    'badge-secondary'
                                }">${booking.status}${booking.waitingPosition ? ` (WL${booking.waitingPosition})` : ''}</span>
                            </div>
                            ${booking.status === 'Waiting' && booking.waitingPosition ? `
                            <div class="flex justify-between bg-yellow-100 dark:bg-yellow-800 p-2 rounded mt-2">
                                <span class="text-gray-700 dark:text-gray-200">Waiting Position:</span>
                                <span class="font-bold text-yellow-700 dark:text-yellow-300">WL${booking.waitingPosition}</span>
                            </div>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>
                                You will be automatically confirmed when a seat becomes available
                            </p>
                            ` : ''}
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Booked On:</span>
                                <span class="font-semibold">${bookingDate.toLocaleDateString('en-IN')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Booking ID:</span>
                                <span class="font-mono font-semibold">#${booking.id}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-600">
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Paid</p>
                        <p class="font-bold text-2xl text-green-600">₹${Math.round((train.price || 50) * 1.05)}</p>
                        <p class="text-xs text-gray-500 mt-1">Including GST</p>
                    </div>
                    
                    ${booking.qrCode ? `
                    <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 text-center">
                        <div class="flex items-center justify-center mb-2">
                            <i class="fas fa-qrcode text-blue-600 mr-2"></i>
                            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Digital Ticket QR Code</p>
                        </div>
                        <img src="${booking.qrCode}" alt="Booking QR Code" class="mx-auto w-48 h-48 border-4 border-white dark:border-gray-600 rounded-lg shadow-lg">
                        <p class="text-xs text-gray-500 mt-2">Scan at station for verification</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="flex space-x-3">
                    <button id="close-modal" class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                        ${t('close')}
                    </button>
                    <button id="cancel-btn" data-id="${booking.id}" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-all">
                        <i class="fas fa-times mr-2"></i>${booking.status === 'Waiting' ? 'Cancel Waiting' : t('cancelBooking')}
                    </button>
                </div>
            </div>
        `;
        document.getElementById('cancel-btn').addEventListener('click', handleCancelBooking);
    } else if (train) {
        // Get tomorrow's date as minimum date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        // Get max date (90 days from now)
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);
        const maxDateStr = maxDate.toISOString().split('T')[0];
        
        modalContent.innerHTML = `
            <div class="p-6">
                <div class="text-center mb-4">
                    <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-ticket-alt text-3xl text-green-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold">${t('confirmBooking')}</h3>
                </div>
                
                <!-- Train Info -->
                <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 p-3 mb-4 rounded">
                    <div class="flex items-center justify-between mb-2">
                        <p class="font-bold text-base">${train.name}</p>
                        <span class="badge badge-info text-xs">${train.trainNumber}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400">From: ${train.fromStation?.name || train.source}</p>
                            <p class="text-gray-500">${train.departureTime || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 dark:text-gray-400">To: ${train.toStation?.name || train.destination}</p>
                            <p class="text-gray-500">${train.arrivalTime || 'N/A'}</p>
                        </div>
                    </div>
                    <p class="text-xs mt-2">
                        <span class="text-gray-600 dark:text-gray-400">Duration:</span> ${train.duration}
                        <span class="ml-3 text-gray-600 dark:text-gray-400">Class:</span> ${train.class}
                    </p>
                </div>
                
                <form id="booking-form">
                    <!-- Passenger Details & Date in Grid -->
                    <div class="grid md:grid-cols-2 gap-3 mb-4">
                        <div>
                            <label class="block text-xs font-semibold mb-1">
                                <i class="fas fa-calendar-alt mr-1 text-blue-600"></i>Journey Date
                            </label>
                            <input 
                                type="date" 
                                id="journey-date" 
                                min="${minDate}"
                                max="${maxDateStr}"
                                required 
                                class="w-full p-2 text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold mb-1">
                                <i class="fas fa-birthday-cake mr-1 text-blue-600"></i>Age
                            </label>
                            <input 
                                type="number" 
                                id="passenger-age" 
                                required 
                                min="1"
                                max="120"
                                placeholder="Enter age"
                                class="w-full p-2 text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-xs font-semibold mb-1">
                            <i class="fas fa-user mr-1 text-blue-600"></i>Passenger Name
                        </label>
                        <input 
                            type="text" 
                            id="passenger-name" 
                            required 
                            placeholder="Enter full name"
                            class="w-full p-2 text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500">
                    </div>
                    
                    <!-- Seat Selection or Waiting List Notice -->
                    ${train.availableSeats > 0 ? `
                    <div class="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <label class="block text-xs font-semibold mb-2">
                            <i class="fas fa-chair mr-1 text-blue-600"></i>Select Your Seat
                        </label>
                        <div id="seat-map-container"></div>
                        <input type="hidden" id="selected-coach" name="coach">
                        <input type="hidden" id="selected-seat" name="seatNumber">
                    </div>
                    ` : `
                    <div class="border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                                    <i class="fas fa-train mr-1"></i>Train Fully Booked
                                </h4>
                                <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                                    All seats are currently occupied. You will be added to the <strong>Waiting List</strong>.
                                </p>
                                <ul class="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 ml-4">
                                    <li><i class="fas fa-check-circle mr-1"></i>Your seat will be auto-assigned when available</li>
                                    <li><i class="fas fa-bell mr-1"></i>You'll receive instant notification upon confirmation</li>
                                    <li><i class="fas fa-list-ol mr-1"></i>Lower waiting list position = Higher chance of confirmation</li>
                                </ul>
                                <input type="hidden" id="selected-coach" name="coach" value="">
                                <input type="hidden" id="selected-seat" name="seatNumber" value="">
                            </div>
                        </div>
                    </div>
                    `}
                    
                    <!-- Billing Summary - Compact -->
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                        <div class="space-y-1 text-sm mb-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Ticket Price:</span>
                                <span class="font-semibold">₹${train.price || TRAIN_BOOKING_FEE}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">GST (5%):</span>
                                <span class="font-semibold">₹${Math.round((train.price || TRAIN_BOOKING_FEE) * 0.05)}</span>
                            </div>
                        </div>
                        <div class="border-t pt-2 flex justify-between">
                            <span class="font-bold">Total Amount:</span>
                            <span class="font-bold text-blue-600 text-lg">₹${Math.round((train.price || TRAIN_BOOKING_FEE) * 1.05)}</span>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex space-x-3">
                        <button type="button" id="close-modal" class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                            ${t('cancel')}
                        </button>
                        <button type="submit" id="confirm-btn" data-id="${train.id}" class="flex-1 ${train.availableSeats > 0 ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all">
                            <i class="fas ${train.availableSeats > 0 ? 'fa-check' : 'fa-list'} mr-2"></i>${train.availableSeats > 0 ? t('confirm') + ' & Pay' : 'Join Waiting List'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('booking-form').addEventListener('submit', handleBookTrain);
        
        // Initialize seat map only if seats are available
        if (train.availableSeats > 0) {
            // Initialize seat map with occupied seats based on available seats
            // Calculate how many seats should be shown as booked
            const totalSeatsInCoach = train.totalSeats;
            const availableSeats = train.availableSeats;
            const seatsToBook = totalSeatsInCoach - availableSeats;
            
            // Generate list of booked seat IDs (randomly distributed across coaches)
            const bookedSeatsList = [];
            const layout = getSeatLayoutForClass(train.class || 'Sleeper');
            
            // Mark seats as booked leaving availableSeats free
            for (let i = 1; i <= seatsToBook; i++) {
                const coachIndex = Math.floor((i - 1) / layout.seatsPerCoach);
                const seatInCoach = ((i - 1) % layout.seatsPerCoach) + 1;
                bookedSeatsList.push(`${layout.coaches[coachIndex]}-${seatInCoach}`);
            }
            
            initializeSeatMap(train.class || 'Sleeper', bookedSeatsList);
        }
        // If no seats available, seat map won't be shown (waiting list mode)
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    document.getElementById('close-modal').addEventListener('click', () => {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    });
}

// --- API Calls and Handlers ---

async function handleRegister(e) {
    e.preventDefault();
    showLoader();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    hideLoader();

    if (response.ok) {
        showMessage(t('registerSuccess'), 'success');
        renderLoginView();
    } else {
        showMessage(data.error || t('registerError'), 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoader();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    hideLoader();

    if (response.ok) {
        userToken = data.token;
        localStorage.setItem('userToken', userToken);
        
        // Store user info including role
        if (data.user) {
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userEmail', data.user.email);
        }
        
        initializeWebSocket();
        showMessage(t('loginSuccess'), 'success');
        
        // Show admin panel if admin, otherwise show dashboard
        if (data.user && data.user.role === 'admin') {
            renderAdminPanel();
        } else {
            fetchTrains();
        }
    } else {
        showMessage(data.error || t('loginError'), 'error');
    }
}

async function handleLogout() {
    localStorage.removeItem('userToken');
    userToken = null;
    disconnectWebSocket();
    showMessage(t('loginSuccess').replace('successful', 'out successful'), 'success');
    renderLoginView();
}

async function fetchTrains(fromStationId = null, toStationId = null) {
    if (!userToken) {
        renderLoginView();
        return;
    }
    showLoader();
    try {
        let trainsResponse;
        
        if (fromStationId && toStationId) {
            // Search trains by station IDs
            trainsResponse = await fetch(`${BASE_URL}/trains/search`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}` 
                },
                body: JSON.stringify({ fromStationId, toStationId })
            });
        } else {
            // Get all trains
            trainsResponse = await fetch(`${BASE_URL}/trains-all`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
        }
        
        const bookingsResponse = await fetch(`${BASE_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        const trainsData = await trainsResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (trainsResponse.ok && bookingsResponse.ok) {
            renderDashboardView(trainsData, bookingsData);
        } else {
            showMessage(t('sessionExpired'), 'error');
            handleLogout();
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        showMessage('An error occurred. Please try again.', 'error');
        handleLogout();
    } finally {
        hideLoader();
    }
}

async function handleBookTrain(e) {
    e.preventDefault();
    
    const trainId = e.target.dataset.id || e.target.closest('form').querySelector('[data-id]').dataset.id;
    const journeyDate = document.getElementById('journey-date').value;
    const passengerName = document.getElementById('passenger-name').value;
    const passengerAge = document.getElementById('passenger-age').value;
    const seatNumber = document.getElementById('selected-seat').value;
    const coachNumber = document.getElementById('selected-coach').value;
    
    if (!journeyDate || !passengerName || !passengerAge) {
        showMessage('Please fill in all passenger details', 'warning');
        return;
    }
    
    // Only require seat selection if seat/coach inputs have values (meaning seats are available)
    // For waiting list (no available seats), these will be empty strings from hidden inputs
    const hasSeatInputs = document.getElementById('seat-map-container');
    if (hasSeatInputs && (!seatNumber || !coachNumber)) {
        showMessage('Please select a seat', 'warning');
        return;
    }
    
    const modal = document.getElementById('booking-modal');
    modal.classList.add('hidden');
    showLoader();

    try {
        const response = await fetch(`${BASE_URL}/trains/${trainId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                journeyDate,
                passengerName,
                passengerAge: parseInt(passengerAge),
                seatNumber: seatNumber || null,
                coachNumber: coachNumber || null,
                allowWaitingList: true
            })
        });

        const data = await response.json();
        hideLoader();

        if (response.ok) {
            const userEmail = localStorage.getItem('userEmail') || 'your email';
            const bookingStatus = data.booking.status;
            const statusMessage = bookingStatus === 'Waiting' 
                ? `Added to Waiting List at position WL${data.booking.waitingPosition}! You'll be notified when confirmed. 🔔`
                : `PNR: ${data.booking.pnrNumber}. Ticket sent to ${userEmail}! 📧`;
            
            showMessage(t('bookingSuccess') + ` ${statusMessage}`, bookingStatus === 'Waiting' ? 'info' : 'success');
            if (socket && socket.connected) {
                socket.emit('new-booking', { trainId, userId: 'current-user', timestamp: new Date() });
            }
            fetchTrains();
        } else {
            showMessage(data.error || t('bookingError'), 'error');
        }
    } catch (error) {
        console.error("Error during booking:", error);
        hideLoader();
        showMessage(t('bookingError'), 'error');
    }
}

async function handleCancelBooking(e) {
    const bookingId = e.target.dataset.id || e.target.closest('button').dataset.id;
    const modal = document.getElementById('booking-modal');
    modal.classList.add('hidden');
    showLoader();

    try {
        const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        const data = await response.json();
        hideLoader();

        if (response.ok) {
            showMessage(t('cancelSuccess'), 'success');
            fetchTrains();
        } else {
            showMessage(data.error || t('cancelError'), 'error');
        }
    } catch (error) {
        console.error("Error during cancellation:", error);
        hideLoader();
        showMessage(t('cancelError'), 'error');
    }
}

// --- Location Search Functions ---

async function initializeLocationSearch() {
    // Load states for both source and destination
    await loadStates();
    
    // Source state change
    document.getElementById('from-state').addEventListener('change', async (e) => {
        const stateId = e.target.value;
        const fromCitySelect = document.getElementById('from-city');
        const fromStationSelect = document.getElementById('from-station');
        
        fromCitySelect.disabled = !stateId;
        fromStationSelect.disabled = true;
        fromCitySelect.innerHTML = '<option value="">Select City</option>';
        fromStationSelect.innerHTML = '<option value="">Select Station</option>';
        
        if (stateId) {
            await loadCities(stateId, 'from-city');
        }
    });
    
    // Source city change
    document.getElementById('from-city').addEventListener('change', async (e) => {
        const cityId = e.target.value;
        const fromStationSelect = document.getElementById('from-station');
        
        fromStationSelect.disabled = !cityId;
        fromStationSelect.innerHTML = '<option value="">Select Station</option>';
        
        if (cityId) {
            await loadStations(cityId, 'from-station');
        }
    });
    
    // Destination state change
    document.getElementById('to-state').addEventListener('change', async (e) => {
        const stateId = e.target.value;
        const toCitySelect = document.getElementById('to-city');
        const toStationSelect = document.getElementById('to-station');
        
        toCitySelect.disabled = !stateId;
        toStationSelect.disabled = true;
        toCitySelect.innerHTML = '<option value="">Select City</option>';
        toStationSelect.innerHTML = '<option value="">Select Station</option>';
        
        if (stateId) {
            await loadCities(stateId, 'to-city');
        }
    });
    
    // Destination city change
    document.getElementById('to-city').addEventListener('change', async (e) => {
        const cityId = e.target.value;
        const toStationSelect = document.getElementById('to-station');
        
        toStationSelect.disabled = !cityId;
        toStationSelect.innerHTML = '<option value="">Select Station</option>';
        
        if (cityId) {
            await loadStations(cityId, 'to-station');
        }
    });
    
    // Search form submission
    document.getElementById('location-search-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fromStationId = document.getElementById('from-station').value;
        const toStationId = document.getElementById('to-station').value;
        
        if (fromStationId && toStationId) {
            await fetchTrains(parseInt(fromStationId), parseInt(toStationId));
        } else {
            showMessage('Please select both source and destination stations', 'warning');
        }
    });
    
    // Reset button
    document.getElementById('reset-search-btn').addEventListener('click', () => {
        document.getElementById('location-search-form').reset();
        document.getElementById('from-city').disabled = true;
        document.getElementById('from-station').disabled = true;
        document.getElementById('to-city').disabled = true;
        document.getElementById('to-station').disabled = true;
        fetchTrains();
    });
}

async function loadStates() {
    try {
        const response = await fetch(`${BASE_URL}/states`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (response.ok) {
            const states = await response.json();
            const fromStateSelect = document.getElementById('from-state');
            const toStateSelect = document.getElementById('to-state');
            
            states.forEach(state => {
                const option1 = document.createElement('option');
                option1.value = state.id;
                option1.textContent = `${state.name} (${state.code})`;
                fromStateSelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = state.id;
                option2.textContent = `${state.name} (${state.code})`;
                toStateSelect.appendChild(option2);
            });
        }
    } catch (error) {
        console.error('Error loading states:', error);
    }
}

async function loadCities(stateId, selectId) {
    try {
        const response = await fetch(`${BASE_URL}/states/${stateId}/cities`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (response.ok) {
            const cities = await response.json();
            const citySelect = document.getElementById(selectId);
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

async function loadStations(cityId, selectId) {
    try {
        const response = await fetch(`${BASE_URL}/cities/${cityId}/stations`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (response.ok) {
            const stations = await response.json();
            const stationSelect = document.getElementById(selectId);
            
            stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = `${station.name} (${station.code})`;
                stationSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading stations:', error);
    }
}

// --- Admin Panel ---
async function renderAdminPanel() {
    viewContainer.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                        <i class="fas fa-cog mr-3"></i>Admin Panel
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 mt-2">Manage trains and system settings</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="fetchTrains()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-eye mr-2"></i>View as User
                    </button>
                    <button onclick="handleLogout()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>

            <!-- Add Train Form -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    <i class="fas fa-plus-circle mr-2 text-green-600"></i>Add New Train
                </h3>
                
                <form id="add-train-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold mb-2">Train Name</label>
                        <input type="text" id="train-name" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="e.g., Rajdhani Express">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Train Number</label>
                        <input type="text" id="train-number" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="e.g., 12345">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">From Station ID</label>
                        <input type="number" id="from-station-id" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="Station ID (1-80)">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">To Station ID</label>
                        <input type="number" id="to-station-id" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="Station ID (1-80)">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Departure Time</label>
                        <input type="time" id="departure-time" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Arrival Time</label>
                        <input type="time" id="arrival-time" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Duration</label>
                        <input type="text" id="duration" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="e.g., 5h 30m">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Price (₹)</label>
                        <input type="number" id="price" required step="0.01"
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="e.g., 1500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Class</label>
                        <select id="train-class" required 
                            class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                            <option value="Sleeper">Sleeper</option>
                            <option value="AC 3-Tier">AC 3-Tier</option>
                            <option value="AC 2-Tier">AC 2-Tier</option>
                            <option value="AC Chair Car">AC Chair Car</option>
                            <option value="AC 1-Tier">AC 1-Tier</option>
                            <option value="Executive Chair">Executive Chair</option>
                        </select>
                    </div>
                    
                    <div class="md:col-span-2">
                        <button type="submit" 
                            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">
                            <i class="fas fa-plus mr-2"></i>Add Train (Default: 3 Coaches, 72 Seats)
                        </button>
                    </div>
                </form>
            </div>

            <!-- Existing Trains List -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    <i class="fas fa-list mr-2 text-blue-600"></i>All Trains
                </h3>
                <div id="admin-trains-list" class="space-y-4">
                    <p class="text-center text-gray-500">Loading trains...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-train-form').addEventListener('submit', handleAddTrain);
    loadAdminTrains();
}

async function handleAddTrain(e) {
    e.preventDefault();
    showLoader();

    const trainData = {
        name: document.getElementById('train-name').value,
        trainNumber: document.getElementById('train-number').value,
        fromStationId: document.getElementById('from-station-id').value,
        toStationId: document.getElementById('to-station-id').value,
        departureTime: document.getElementById('departure-time').value,
        arrivalTime: document.getElementById('arrival-time').value,
        duration: document.getElementById('duration').value,
        price: document.getElementById('price').value,
        trainClass: document.getElementById('train-class').value
    };

    try {
        const response = await fetch(`${BASE_URL}/admin/trains`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(trainData)
        });

        const data = await response.json();
        hideLoader();

        if (response.ok) {
            showMessage('Train added successfully! (72 seats, 3 coaches)', 'success');
            document.getElementById('add-train-form').reset();
            loadAdminTrains();
        } else {
            showMessage(data.error || 'Failed to add train', 'error');
        }
    } catch (error) {
        hideLoader();
        showMessage('Error adding train', 'error');
    }
}

async function loadAdminTrains() {
    try {
        const response = await fetch(`${BASE_URL}/admin/trains`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        const trains = await response.json();
        const container = document.getElementById('admin-trains-list');

        if (trains.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No trains found</p>';
            return;
        }

        container.innerHTML = trains.map(train => `
            <div class="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="text-xl font-bold">${train.name}</h4>
                            <span class="badge badge-info">${train.trainNumber}</span>
                            <span class="badge badge-success">${train.class}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <i class="fas fa-route mr-2"></i>
                            ${train.fromStation?.name || 'N/A'} → ${train.toStation?.name || 'N/A'}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <i class="fas fa-clock mr-2"></i>
                            ${train.departureTime} - ${train.arrivalTime} (${train.duration})
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <i class="fas fa-chair mr-2"></i>
                            ${train.availableSeats}/${train.totalSeats} seats | ₹${train.price}
                        </p>
                    </div>
                    <button onclick="handleDeleteTrain(${train.id})" 
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading trains:', error);
    }
}

async function handleDeleteTrain(trainId) {
    if (!confirm('Are you sure you want to delete this train?')) return;

    showLoader();
    try {
        const response = await fetch(`${BASE_URL}/admin/trains/${trainId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        const data = await response.json();
        hideLoader();

        if (response.ok) {
            showMessage('Train deleted successfully!', 'success');
            loadAdminTrains();
        } else {
            showMessage(data.error || 'Failed to delete train', 'error');
        }
    } catch (error) {
        hideLoader();
        showMessage('Error deleting train', 'error');
    }
}

// --- Initial Setup and Event Listeners ---

// Dark mode toggle
modeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    sunIcon.classList.toggle('hidden');
    moonIcon.classList.toggle('hidden');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Set initial theme
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
}

// Fetch and display current time
async function fetchTime() {
    try {
        const now = new Date();
        timeText.textContent = now.toLocaleTimeString();
    } catch (error) {
        console.error("Error fetching time:", error);
    }
}

// Check for existing token on page load
function checkAuth() {
    if (userToken) {
        initializeWebSocket();
        fetchTrains();
    } else {
        renderLoginView();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchTime();
    setInterval(fetchTime, 1000);
});
