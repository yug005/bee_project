// API Endpoints and State
const BASE_URL = 'http://localhost:3000/api';
let userToken = localStorage.getItem('userToken') || null;

// DOM Elements
const viewContainer = document.getElementById('view-container');
const messageContainer = document.getElementById('message-container');
const loader = document.getElementById('loader');
const modeToggle = document.getElementById('mode-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const mainCard = document.getElementById('main-card');
const timeDisplay = document.getElementById('time-display');

// Global state and constants
const TRAIN_BOOKING_FEE = 50;

// --- Utility Functions ---

function showMessage(message, type = 'success') {
    messageContainer.innerHTML = '';
    const messageEl = document.createElement('div');
    messageEl.className = `p-3 rounded-lg text-sm transition-all duration-300 transform scale-95 opacity-0 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
    messageEl.textContent = message;
    messageContainer.appendChild(messageEl);

    // Animate the message in and out
    setTimeout(() => {
        messageEl.classList.remove('scale-95', 'opacity-0');
        messageEl.classList.add('scale-100', 'opacity-100');
    }, 10);
    setTimeout(() => {
        messageEl.classList.remove('scale-100', 'opacity-100');
        messageEl.classList.add('scale-95', 'opacity-0');
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
        <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
        <form id="login-form" class="space-y-4">
            <div>
                <label for="login-email" class="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="login-email" name="email" class="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
                <label for="login-password" class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="login-password" name="password" class="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">Log In</button>
        </form>
        <p class="mt-4 text-center text-sm">Don't have an account? <a href="#" id="show-register" class="text-blue-500 hover:underline">Register here</a></p>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        renderRegisterView();
    });
}

function renderRegisterView() {
    viewContainer.innerHTML = `
        <h2 class="text-2xl font-bold text-center mb-6">Register</h2>
        <form id="register-form" class="space-y-4">
            <div>
                <label for="register-email" class="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="register-email" name="email" class="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
                <label for="register-password" class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="register-password" name="password" class="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <button type="submit" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-300">Register</button>
        </form>
        <p class="mt-4 text-center text-sm">Already have an account? <a href="#" id="show-login" class="text-blue-500 hover:underline">Log in here</a></p>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        renderLoginView();
    });
}

function renderDashboardView(trains, bookings) {
    let trainListHtml = '<div class="space-y-4">';
    trains.forEach(train => {
        const isBooked = bookings.some(booking => booking.trainId === train.id);
        const canBook = train.availableSeats > 0;
        const buttonText = isBooked ? 'View Booking' : (canBook ? 'Book Now' : 'Sold Out');
        const buttonClass = isBooked ? 'bg-indigo-500 hover:bg-indigo-600' : (canBook ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed');

        trainListHtml += `
            <div class="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div>
                    <h3 class="font-bold text-lg">${train.name}</h3>
                    <p class="text-sm">From: ${train.source} to: ${train.destination}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Available Seats: ${train.availableSeats}/${train.totalSeats}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Departure Time: ${train.time}</p>
                </div>
                <button data-id="${train.id}" data-booked="${isBooked}" class="book-btn w-full sm:w-auto px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${buttonClass}" ${!canBook && !isBooked ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });
    trainListHtml += '</div>';

    viewContainer.innerHTML = `
        <h2 class="text-2xl font-bold text-center mb-6">Available Trains</h2>
        <div class="flex justify-end mb-4">
            <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-300">Log Out</button>
        </div>
        ${trains.length === 0 ? '<p class="text-center text-gray-500">No trains available at the moment.</p>' : trainListHtml}
        <div id="booking-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div id="modal-content" class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm transform scale-95 opacity-0 transition-all duration-300"></div>
        </div>
    `;

    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const trainId = e.target.dataset.id;
            const isBooked = e.target.dataset.booked === 'true';
            if (isBooked) {
                const booking = bookings.find(b => b.trainId == trainId);
                showBookingConfirmation(booking);
            } else {
                showBookingConfirmation(null, trainId);
            }
        });
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function showBookingConfirmation(booking = null, trainId = null) {
    const modal = document.getElementById('booking-modal');
    const modalContent = document.getElementById('modal-content');

    if (booking) {
        // View existing booking
        modalContent.innerHTML = `
            <h3 class="text-xl font-bold mb-4 text-center">Your Booking</h3>
            <p><strong>Train ID:</strong> ${booking.trainId}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Booked At:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
            <div class="mt-6 flex justify-between">
                <button id="close-modal" class="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Close</button>
                <button id="cancel-btn" data-id="${booking.id}" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300">Cancel Booking</button>
            </div>
        `;
        document.getElementById('cancel-btn').addEventListener('click', handleCancelBooking);
    } else {
        // Confirm new booking
        modalContent.innerHTML = `
            <h3 class="text-xl font-bold mb-4 text-center">Confirm Booking</h3>
            <p>Are you sure you want to book this seat?</p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">A fee of $${TRAIN_BOOKING_FEE} will be applied.</p>
            <div class="mt-6 flex justify-between">
                <button id="close-modal" class="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Cancel</button>
                <button id="confirm-btn" data-id="${trainId}" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">Confirm</button>
            </div>
        `;
        document.getElementById('confirm-btn').addEventListener('click', handleBookTrain);
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
        showMessage(data.message, 'success');
        renderLoginView();
    } else {
        showMessage(data.error || 'Registration failed.', 'error');
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
        showMessage(data.message, 'success');
        fetchTrains();
    } else {
        showMessage(data.error || 'Login failed. Please check your credentials.', 'error');
    }
}

async function handleLogout() {
    localStorage.removeItem('userToken');
    userToken = null;
    showMessage('Logged out successfully.', 'success');
    renderLoginView();
}

async function fetchTrains() {
    if (!userToken) {
        renderLoginView();
        return;
    }
    showLoader();
    try {
        const [trainsResponse, bookingsResponse] = await Promise.all([
            fetch(`${BASE_URL}/trains`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            }),
            fetch(`${BASE_URL}/bookings`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            })
        ]);

        const trainsData = await trainsResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (trainsResponse.ok && bookingsResponse.ok) {
            renderDashboardView(trainsData, bookingsData);
        } else {
            showMessage('Session expired. Please log in again.', 'error');
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
    const trainId = e.target.dataset.id;
    const modal = document.getElementById('booking-modal');
    modal.classList.add('hidden');
    showLoader();

    try {
        const response = await fetch(`${BASE_URL}/trains/${trainId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        const data = await response.json();
        hideLoader();

        if (response.ok) {
            showMessage(data.message, 'success');
            fetchTrains();
        } else {
            showMessage(data.error || 'Booking failed.', 'error');
        }
    } catch (error) {
        console.error("Error during booking:", error);
        hideLoader();
        showMessage('An error occurred during booking. Please try again.', 'error');
    }
}

async function handleCancelBooking(e) {
    const bookingId = e.target.dataset.id;
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
            showMessage(data.message, 'success');
            fetchTrains();
        } else {
            showMessage(data.error || 'Cancellation failed.', 'error');
        }
    } catch (error) {
        console.error("Error during cancellation:", error);
        hideLoader();
        showMessage('An error occurred during cancellation. Please try again.', 'error');
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
        const response = await fetch(`${BASE_URL}/time`);
        const data = await response.json();
        if (response.ok) {
            timeDisplay.textContent = `Current Time: ${data.currentTime}`;
        }
    } catch (error) {
        console.error("Error fetching time:", error);
    }
}

// Check for existing token on page load
function checkAuth() {
    if (userToken) {
        fetchTrains();
    } else {
        renderLoginView();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchTime();
    setInterval(fetchTime, 1000); // Update time every second
});
