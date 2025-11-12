// Seat Selection Component
// This handles visual seat map selection for train bookings

// Seat configurations for different train classes
const SEAT_LAYOUTS = {
    'Sleeper': {
        rows: 12,
        columns: 8,
        layout: 'SL', // Side Lower, Middle, Upper, Side Upper
        seatsPerCoach: 72,
        coaches: ['S1', 'S2', 'S3', 'S4', 'S5']
    },
    '3AC': {
        rows: 12,
        columns: 6,
        layout: '3AC',
        seatsPerCoach: 64,
        coaches: ['A1', 'A2', 'A3']
    },
    '2AC': {
        rows: 10,
        columns: 4,
        layout: '2AC',
        seatsPerCoach: 48,
        coaches: ['B1', 'B2']
    },
    'AC Chair Car': {
        rows: 10,
        columns: 5,
        layout: 'CC',
        seatsPerCoach: 78,
        coaches: ['C1', 'C2', 'C3']
    },
    '1AC': {
        rows: 8,
        columns: 4,
        layout: '1AC',
        seatsPerCoach: 24,
        coaches: ['H1']
    },
    'Executive Chair': {
        rows: 7,
        columns: 4,
        layout: 'EC',
        seatsPerCoach: 44,
        coaches: ['E1', 'E2']
    }
};

// Get seat layout configuration
function getSeatLayout(trainClass) {
    return SEAT_LAYOUTS[trainClass] || SEAT_LAYOUTS['Sleeper'];
}

// Generate seat map HTML
function generateSeatMap(trainClass, selectedCoach = null, bookedSeats = []) {
    const layout = getSeatLayout(trainClass);
    
    if (!selectedCoach) {
        selectedCoach = layout.coaches[0];
    }
    
    let html = `
        <div class="seat-selection-container">
            <!-- Coach Selection -->
            <div class="mb-3">
                <label class="block text-xs font-semibold mb-2">
                    <i class="fas fa-subway mr-1 text-blue-600"></i>Select Coach
                </label>
                <div class="flex flex-wrap gap-2">
                    ${layout.coaches.map(coach => `
                        <button 
                            type="button"
                            class="coach-btn px-3 py-1 text-sm rounded-lg font-semibold transition-all ${coach === selectedCoach ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}"
                            data-coach="${coach}"
                            onclick="selectCoach('${coach}', '${trainClass}')">
                            ${coach}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Legend -->
            <div class="mb-3 flex flex-wrap gap-3 text-xs">
                <div class="flex items-center">
                    <div class="seat-legend available"></div>
                    <span class="ml-1">Available</span>
                </div>
                <div class="flex items-center">
                    <div class="seat-legend selected"></div>
                    <span class="ml-1">Selected</span>
                </div>
                <div class="flex items-center">
                    <div class="seat-legend booked"></div>
                    <span class="ml-1">Booked</span>
                </div>
            </div>
            
            <!-- Seat Map -->
            <div class="seat-map-wrapper">
                <div class="seat-map ${layout.layout.toLowerCase()}">
                    ${generateSeats(layout, selectedCoach, bookedSeats)}
                </div>
            </div>
            
            <!-- Selected Seat Info -->
            <div id="selected-seat-info" class="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg hidden">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-600 dark:text-gray-400">Selected Seat</p>
                        <p class="font-bold text-sm" id="selected-seat-display">-</p>
                    </div>
                    <button 
                        type="button"
                        onclick="clearSeatSelection()"
                        class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// Generate individual seats
function generateSeats(layout, coach, bookedSeats) {
    let seatsHTML = '';
    let seatNumber = 1;
    
    for (let row = 1; row <= layout.rows; row++) {
        seatsHTML += '<div class="seat-row">';
        
        if (layout.layout === 'SL') {
            // Sleeper Class: 8 seats per row (Side Lower, Lower, Middle, Upper, Upper, Middle, Lower, Side Upper)
            for (let col = 1; col <= layout.columns; col++) {
                const seatId = `${coach}-${seatNumber}`;
                const isBooked = bookedSeats.includes(seatId);
                const seatType = col === 1 ? 'SL' : col === 8 ? 'SU' : col % 2 === 0 ? 'LB' : 'UB';
                
                seatsHTML += `
                    <div class="seat ${isBooked ? 'booked' : 'available'}" 
                         data-seat="${seatId}"
                         data-seat-number="${seatNumber}"
                         onclick="toggleSeat('${seatId}', ${isBooked})">
                        <span class="seat-number">${seatNumber}</span>
                        <span class="seat-type">${seatType}</span>
                    </div>
                `;
                seatNumber++;
            }
        } else if (layout.layout === '3AC') {
            // 3AC: 6 seats per row (Side Lower, Side Upper, Lower, Middle, Upper, Lower)
            for (let col = 1; col <= layout.columns; col++) {
                const seatId = `${coach}-${seatNumber}`;
                const isBooked = bookedSeats.includes(seatId);
                
                seatsHTML += `
                    <div class="seat ${isBooked ? 'booked' : 'available'}" 
                         data-seat="${seatId}"
                         data-seat-number="${seatNumber}"
                         onclick="toggleSeat('${seatId}', ${isBooked})">
                        <span class="seat-number">${seatNumber}</span>
                    </div>
                `;
                seatNumber++;
            }
        } else if (layout.layout === '2AC') {
            // 2AC: 4 seats per row (Lower, Upper, Lower, Upper)
            for (let col = 1; col <= layout.columns; col++) {
                const seatId = `${coach}-${seatNumber}`;
                const isBooked = bookedSeats.includes(seatId);
                
                seatsHTML += `
                    <div class="seat ${isBooked ? 'booked' : 'available'}" 
                         data-seat="${seatId}"
                         data-seat-number="${seatNumber}"
                         onclick="toggleSeat('${seatId}', ${isBooked})">
                        <span class="seat-number">${seatNumber}</span>
                    </div>
                `;
                seatNumber++;
            }
        } else if (layout.layout === 'CC' || layout.layout === 'EC') {
            // Chair Car: 5 or 4 seats per row
            for (let col = 1; col <= layout.columns; col++) {
                const seatId = `${coach}-${seatNumber}`;
                const isBooked = bookedSeats.includes(seatId);
                
                if (col === Math.ceil(layout.columns / 2)) {
                    seatsHTML += '<div class="seat-aisle"></div>';
                }
                
                seatsHTML += `
                    <div class="seat ${isBooked ? 'booked' : 'available'}" 
                         data-seat="${seatId}"
                         data-seat-number="${seatNumber}"
                         onclick="toggleSeat('${seatId}', ${isBooked})">
                        <span class="seat-number">${seatNumber}</span>
                    </div>
                `;
                seatNumber++;
            }
        }
        
        seatsHTML += '</div>';
    }
    
    return seatsHTML;
}

// Select coach
function selectCoach(coach, trainClass) {
    const container = document.getElementById('seat-map-container');
    container.innerHTML = generateSeatMap(trainClass, coach);
}

// Toggle seat selection
let selectedSeatGlobal = null;

function toggleSeat(seatId, isBooked) {
    if (isBooked) {
        showMessage('This seat is already booked', 'warning');
        return;
    }
    
    // Remove previous selection
    if (selectedSeatGlobal) {
        const prevSeat = document.querySelector(`[data-seat="${selectedSeatGlobal}"]`);
        if (prevSeat) {
            prevSeat.classList.remove('selected');
        }
    }
    
    // Select new seat
    const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
    if (seatElement) {
        seatElement.classList.add('selected');
        selectedSeatGlobal = seatId;
        
        // Update hidden inputs
        const [coach, seatNum] = seatId.split('-');
        document.getElementById('selected-coach').value = coach;
        document.getElementById('selected-seat').value = seatNum;
        
        // Show selection info
        const infoBox = document.getElementById('selected-seat-info');
        const displayText = document.getElementById('selected-seat-display');
        displayText.textContent = seatId;
        infoBox.classList.remove('hidden');
    }
}

// Clear seat selection
function clearSeatSelection() {
    if (selectedSeatGlobal) {
        const seatElement = document.querySelector(`[data-seat="${selectedSeatGlobal}"]`);
        if (seatElement) {
            seatElement.classList.remove('selected');
        }
        selectedSeatGlobal = null;
        
        // Clear hidden inputs
        document.getElementById('selected-coach').value = '';
        document.getElementById('selected-seat').value = '';
        
        // Hide selection info
        document.getElementById('selected-seat-info').classList.add('hidden');
    }
}

// Get currently selected seat
function getSelectedSeat() {
    return {
        seatId: selectedSeatGlobal,
        coach: document.getElementById('selected-coach')?.value || '',
        seatNumber: document.getElementById('selected-seat')?.value || ''
    };
}

// Initialize seat map
function initializeSeatMap(trainClass, bookedSeats = []) {
    const container = document.getElementById('seat-map-container');
    if (container) {
        container.innerHTML = generateSeatMap(trainClass, null, bookedSeats);
    }
}
