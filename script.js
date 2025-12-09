// Sync server URL - change this to your server URL
const SYNC_URL = 'https://absensi-hadir-guru.vercel.app/sync';

// Global variables
let attendanceData = [];
let attendanceOpen = false;
let attendanceOpenTime = null;

const form = document.getElementById('attendanceForm');
const nameInput = document.getElementById('name');
const statusSelect = document.getElementById('status');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Function to validate form
function validateForm() {
    if (!nameInput.value.trim()) {
        showError('Nama siswa tidak boleh kosong');
        return false;
    }
    if (!statusSelect.value) {
        showError('Status absensi harus dipilih');
        return false;
    }
    return true;
}

// Function to show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// Function to show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Function to sync data from server
async function syncDataFromServer() {
    try {
        const response = await fetch(SYNC_URL);
        if (response.ok) {
            const data = await response.json();
            attendanceData = data.attendanceData || [];
            attendanceOpen = data.attendanceOpen || false;
            attendanceOpenTime = data.attendanceOpenTime;

            // Also update localStorage for backup
            localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
            localStorage.setItem('attendanceOpen', attendanceOpen.toString());
            if (attendanceOpenTime) {
                localStorage.setItem('attendanceOpenTime', attendanceOpenTime.toString());
            } else {
                localStorage.removeItem('attendanceOpenTime');
            }

            updateAttendanceUI();
        } else {
            console.error('Failed to sync data from server');
            // Fallback to localStorage
            attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
            attendanceOpen = localStorage.getItem('attendanceOpen') === 'true';
            attendanceOpenTime = localStorage.getItem('attendanceOpenTime');
        }
    } catch (error) {
        console.error('Error syncing data:', error);
        // Fallback to localStorage
        attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
        attendanceOpen = localStorage.getItem('attendanceOpen') === 'true';
        attendanceOpenTime = localStorage.getItem('attendanceOpenTime');
    }
}

// Function to save attendance data
async function saveAttendance(name, status) {
    const attendance = {
        name: name,
        status: status
    };

    try {
        const response = await fetch(SYNC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Attendance saved to server:', result.message);
            // Sync data after saving
            await syncDataFromServer();
            return true;
        } else {
            console.error('Failed to save attendance to server');
            // Fallback to localStorage
            const now = new Date();
            const timestamp = now.toLocaleString('id-ID');
            const localAttendance = {
                name: name,
                status: status,
                timestamp: timestamp
            };
            attendanceData.unshift(localAttendance);
            localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
            return true;
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        // Fallback to localStorage
        const now = new Date();
        const timestamp = now.toLocaleString('id-ID');
        const localAttendance = {
            name: name,
            status: status,
            timestamp: timestamp
        };
        attendanceData.unshift(localAttendance);
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        return true;
    }
}

// Function to check if attendance is open
function isAttendanceOpen() {
    return attendanceOpen;
}

// Function to update attendance UI based on status
function updateAttendanceUI() {
    const attendanceClosed = document.getElementById('attendanceClosed');
    const attendanceFormContainer = document.getElementById('attendanceFormContainer');

    if (isAttendanceOpen()) {
        attendanceClosed.style.display = 'none';
        attendanceFormContainer.style.display = 'block';
        startCountdownTimer();
    } else {
        attendanceClosed.style.display = 'block';
        attendanceFormContainer.style.display = 'none';
        stopCountdownTimer();
    }
}

// Countdown timer variables
let countdownInterval;

// Function to start countdown timer
function startCountdownTimer() {
    const openTime = localStorage.getItem('attendanceOpenTime');
    if (!openTime) return;

    const countdownTimer = document.getElementById('countdownTimer');
    const timerDisplay = document.getElementById('timerDisplay');

    countdownTimer.style.display = 'block';

    function updateTimer() {
        const now = Date.now();
        const elapsed = now - parseInt(openTime);
        const remaining = 3600000 - elapsed; // 1 hour in milliseconds
        //const remaining = 10000 - elapsed; // 1 hour in milliseconds

        if (remaining <= 0) {
            // Time's up - close attendance
            localStorage.setItem('attendanceOpen', 'false');
            localStorage.removeItem('attendanceOpenTime');
            updateAttendanceUI();
            stopCountdownTimer();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Add urgent styling for last 10 minutes
        const timerContainer = countdownTimer;
        if (remaining <= 600000) { // 10 minutes
            timerContainer.classList.add('timer-urgent');
        } else {
            timerContainer.classList.remove('timer-urgent');
        }
    }

    // Update immediately
    updateTimer();

    // Update every second
    countdownInterval = setInterval(updateTimer, 1000);
}

// Function to stop countdown timer
function stopCountdownTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const countdownTimer = document.getElementById('countdownTimer');
    countdownTimer.style.display = 'none';
    countdownTimer.classList.remove('timer-urgent');
}

// Listen for localStorage changes (when admin changes attendance status)
window.addEventListener('storage', function(e) {
    if (e.key === 'attendanceOpen') {
        updateAttendanceUI();
    }
});

// Periodic sync interval (30 seconds)
let syncInterval;

// Function to start periodic syncing
function startPeriodicSync() {
    // Initial sync
    syncDataFromServer();

    // Sync every 30 seconds
    syncInterval = setInterval(syncDataFromServer, 30000);
}

// Function to stop periodic syncing
function stopPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    startPeriodicSync();
});

// Form submit event listener
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isAttendanceOpen()) {
        showError('Absensi belum dibuka oleh admin. Silakan tunggu sampai admin membuka halaman absensi.');
        return;
    }
    if (validateForm()) {
        saveAttendance(nameInput.value.trim(), statusSelect.value);
        showSuccess('Data absensi berhasil dikirim ke admin!');
        form.reset();
    }
});
