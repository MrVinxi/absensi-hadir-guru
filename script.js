// Initialize Firebase references
let attendanceData = [];
let attendanceStatus = false;
let attendanceOpenTime = null;

// Firebase references
let attendanceRef;
let statusRef;
let openTimeRef;

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be available
    const checkFirebase = setInterval(() => {
        if (window.firebaseDB && window.firebaseRef && window.firebaseOnValue) {
            clearInterval(checkFirebase);
            initializeFirebase();
        }
    }, 100);
});

function initializeFirebase() {
    // Create Firebase references
    attendanceRef = window.firebaseRef(window.firebaseDB, 'attendanceData');
    statusRef = window.firebaseRef(window.firebaseDB, 'attendanceOpen');
    openTimeRef = window.firebaseRef(window.firebaseDB, 'attendanceOpenTime');

    // Listen for attendance data changes
    window.firebaseOnValue(attendanceRef, (snapshot) => {
        const data = snapshot.val();
        attendanceData = data ? Object.values(data) : [];
        // Update UI if needed
    });

    // Listen for attendance status changes
    window.firebaseOnValue(statusRef, (snapshot) => {
        attendanceStatus = snapshot.val() === true;
        updateAttendanceUI();
    });

    // Listen for open time changes
    window.firebaseOnValue(openTimeRef, (snapshot) => {
        attendanceOpenTime = snapshot.val();
        if (attendanceStatus) {
            startCountdownTimer();
        }
    });
}

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

// Function to save attendance data
function saveAttendance(name, status) {
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID');
    const attendance = {
        name: name,
        status: status,
        timestamp: timestamp
    };

    // Save to localStorage as JSON
    attendanceData.unshift(attendance);
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Function to check if attendance is open
function isAttendanceOpen() {
    return localStorage.getItem('attendanceOpen') === 'true';
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

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAttendanceUI();
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
