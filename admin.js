// Initialize attendance data from localStorage
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

// Login elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const closeLogin = document.getElementById('closeLogin');
const adminDashboard = document.getElementById('adminDashboard');

// Admin dashboard elements
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const adminBody = document.getElementById('adminBody');
const saveDataBtn = document.getElementById('saveDataBtn');
const downloadBtn = document.getElementById('downloadBtn');
const attendanceToggle = document.getElementById('attendanceToggle');
const toggleText = document.getElementById('toggleText');

// Admin credentials (in a real app, this would be server-side)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Check if admin is already logged in
const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

if (isLoggedIn) {
    showAdminDashboard();
} else {
    showLoginModal();
}

// Function to show login modal
function showLoginModal() {
    loginModal.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// Function to show admin dashboard
function showAdminDashboard() {
    loginModal.style.display = 'none';
    adminDashboard.style.display = 'block';
    renderAdminTable();
    updateToggleState();
}

// Function to handle login
function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminDashboard();
    } else {
        showLoginError('Username atau password salah');
    }
}

// Function to show login error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 3000);
}

// Function to render admin table
function renderAdminTable(data = attendanceData) {
    adminBody.innerHTML = '';
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = item.status.toLowerCase();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.status}</td>
            <td>${item.timestamp}</td>
            <td><button class="delete-btn" data-index="${index}">🗑️ Hapus</button></td>
        `;
        adminBody.appendChild(row);
    });
}

// Function to filter data
function filterData() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterStatus = filterSelect.value;
    
    let filteredData = attendanceData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesFilter = !filterStatus || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    renderAdminTable(filteredData);
}

// Function to delete attendance record
function deleteRecord(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) {
        attendanceData.splice(index, 1);
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        filterData(); // Re-render with current filters
    }
}

// Function to save data as JSON file
function saveDataAsFile() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '-');
    const filename = `absensi_guru_${dateStr}_${timeStr}.json`;

    const dataToSave = {
        school: "SMK Muhammadiyah 1 Pandaan",
        exportDate: now.toLocaleString('id-ID'),
        totalRecords: attendanceData.length,
        attendanceData: attendanceData
    };

    const jsonContent = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Function to download report as CSV
function downloadReport() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "No,Nama,Status,Waktu\n"
        + attendanceData.map((item, index) =>
            `${index + 1},${item.name},${item.status},${item.timestamp}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_absensi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to update toggle state
function updateToggleState() {
    const isOpen = localStorage.getItem('attendanceOpen') === 'true';
    attendanceToggle.checked = isOpen;
    toggleText.textContent = isOpen ? '🔓 Buka Absensi' : '🔒 Tutup Absensi';
}

// Function to toggle attendance status
function toggleAttendance() {
    const isOpen = attendanceToggle.checked;

    // Update Firebase
    if (statusRef) {
        window.firebaseSet(statusRef, isOpen);
    }

    // Also update localStorage for immediate UI updates
    localStorage.setItem('attendanceOpen', isOpen.toString());

    if (isOpen) {
        // Set timestamp when attendance is opened
        const openTime = Date.now();
        if (openTimeRef) {
            window.firebaseSet(openTimeRef, openTime);
        }
        localStorage.setItem('attendanceOpenTime', openTime.toString());

        // Set auto-close after 1 hour (3600000 milliseconds)
        setTimeout(() => {
            // Close attendance in Firebase
            if (statusRef) {
                window.firebaseSet(statusRef, false);
            }
            if (openTimeRef) {
                window.firebaseSet(openTimeRef, null);
            }
            // Update localStorage
            localStorage.setItem('attendanceOpen', 'false');
            localStorage.removeItem('attendanceOpenTime');
            // Update toggle if admin is still on the page
            if (attendanceToggle) {
                attendanceToggle.checked = false;
                toggleText.textContent = '🔒 Tutup Absensi';
            }
        }, 3600000); // 1 hour
    } else {
        // Clear timer when manually closed
        if (openTimeRef) {
            window.firebaseSet(openTimeRef, null);
        }
        localStorage.removeItem('attendanceOpenTime');
    }

    toggleText.textContent = isOpen ? '🔓 Buka Absensi' : '🔒 Tutup Absensi';
}

// Event listeners
loginForm.addEventListener('submit', handleLogin);
closeLogin.addEventListener('click', () => {
    // Clear session and redirect to student page
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
});

searchInput.addEventListener('input', filterData);
filterSelect.addEventListener('change', filterData);
saveDataBtn.addEventListener('click', saveDataAsFile);
downloadBtn.addEventListener('click', downloadReport);
attendanceToggle.addEventListener('change', toggleAttendance);

// Event delegation for delete buttons
adminBody.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        deleteRecord(index);
    }
});
