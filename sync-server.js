const http = require('http');
const fs = require('fs');
const path = require('path');

// Data file path
const DATA_FILE = path.join(__dirname, 'attendance_data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        attendanceOpen: false,
        attendanceOpenTime: null,
        attendanceData: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper function to read data
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { attendanceOpen: false, attendanceOpenTime: null, attendanceData: [] };
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// Create server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/sync') {
        if (req.method === 'GET') {
            // Return current data
            const data = readData();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));

        } else if (req.method === 'POST') {
            // Add new attendance record
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const input = JSON.parse(body);
                    if (input && input.name && input.status) {
                        const data = readData();

                        const attendance = {
                            name: input.name,
                            status: input.status,
                            timestamp: new Date().toLocaleString('id-ID')
                        };

                        data.attendanceData.unshift(attendance);
                        writeData(data);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Data absensi berhasil disimpan' }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Data tidak valid' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'JSON tidak valid' }));
                }
            });

        } else if (req.method === 'PUT') {
            // Update attendance status
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const input = JSON.parse(body);
                    if (input && typeof input.attendanceOpen === 'boolean') {
                        const data = readData();

                        data.attendanceOpen = input.attendanceOpen;
                        data.attendanceOpenTime = input.attendanceOpen ? Date.now() : null;

                        writeData(data);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Status absensi berhasil diupdate' }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Data tidak valid' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'JSON tidak valid' }));
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete attendance record
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const input = JSON.parse(body);
                    if (input && typeof input.index === 'number') {
                        const data = readData();

                        if (data.attendanceData[input.index]) {
                            data.attendanceData.splice(input.index, 1);
                            writeData(data);

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Data absensi berhasil dihapus' }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Data tidak ditemukan' }));
                        }
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Index tidak valid' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'JSON tidak valid' }));
                }
            });

        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Method tidak didukung' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Endpoint tidak ditemukan' }));
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sync server running on port ${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
    console.log('Ready to sync attendance data across devices!');
});
