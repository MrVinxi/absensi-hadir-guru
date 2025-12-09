<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// File to store attendance data
$dataFile = 'attendance_data.json';

// Ensure data directory exists
if (!file_exists(dirname($dataFile))) {
    mkdir(dirname($dataFile), 0755, true);
}

// Initialize data file if it doesn't exist
if (!file_exists($dataFile)) {
    $initialData = [
        'attendanceOpen' => false,
        'attendanceOpenTime' => null,
        'attendanceData' => []
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Return current data
        $data = json_decode(file_get_contents($dataFile), true);
        echo json_encode($data);
        break;

    case 'POST':
        // Update attendance data (add new record)
        $input = json_decode(file_get_contents('php://input'), true);

        if ($input && isset($input['name']) && isset($input['status'])) {
            $data = json_decode(file_get_contents($dataFile), true);

            $attendance = [
                'name' => $input['name'],
                'status' => $input['status'],
                'timestamp' => date('d/m/Y H:i:s')
            ];

            array_unshift($data['attendanceData'], $attendance);
            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

            echo json_encode(['success' => true, 'message' => 'Data absensi berhasil disimpan']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
        }
        break;

    case 'PUT':
        // Update attendance status
        $input = json_decode(file_get_contents('php://input'), true);

        if ($input && isset($input['attendanceOpen'])) {
            $data = json_decode(file_get_contents($dataFile), true);

            $data['attendanceOpen'] = $input['attendanceOpen'];

            if ($input['attendanceOpen']) {
                $data['attendanceOpenTime'] = time() * 1000; // JavaScript timestamp
            } else {
                $data['attendanceOpenTime'] = null;
            }

            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

            echo json_encode(['success' => true, 'message' => 'Status absensi berhasil diupdate']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
        }
        break;

    case 'DELETE':
        // Delete attendance record
        $input = json_decode(file_get_contents('php://input'), true);

        if ($input && isset($input['index'])) {
            $data = json_decode(file_get_contents($dataFile), true);

            if (isset($data['attendanceData'][$input['index']])) {
                array_splice($data['attendanceData'], $input['index'], 1);
                file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

                echo json_encode(['success' => true, 'message' => 'Data absensi berhasil dihapus']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Index tidak valid']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method tidak didukung']);
        break;
}
?>
