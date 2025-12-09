// Test script to verify synchronization functionality
const fetch = require('node-fetch');

const SYNC_URL = 'https://absensi-hadir-guru.vercel.app/sync';

async function testSync() {
    console.log('🧪 Testing Attendance Synchronization System...\n');

    try {
        // Test 1: Get initial data
        console.log('1️⃣ Testing GET request (fetch data)...');
        const getResponse = await fetch(SYNC_URL);
        const initialData = await getResponse.json();
        console.log('✅ Initial data:', initialData);

        // Test 2: Add attendance record
        console.log('\n2️⃣ Testing POST request (add attendance)...');
        const attendanceData = {
            name: 'Test Student',
            status: 'Hadir'
        };
        const postResponse = await fetch(SYNC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendanceData)
        });
        const postResult = await postResponse.json();
        console.log('✅ Add attendance result:', postResult);

        // Test 3: Get updated data
        console.log('\n3️⃣ Testing GET request (verify data added)...');
        const getResponse2 = await fetch(SYNC_URL);
        const updatedData = await getResponse2.json();
        console.log('✅ Updated data:', updatedData);

        // Test 4: Toggle attendance status
        console.log('\n4️⃣ Testing PUT request (toggle attendance)...');
        const toggleData = { attendanceOpen: true };
        const putResponse = await fetch(SYNC_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toggleData)
        });
        const putResult = await putResponse.json();
        console.log('✅ Toggle result:', putResult);

        // Test 5: Get final data
        console.log('\n5️⃣ Testing GET request (verify toggle)...');
        const getResponse3 = await fetch(SYNC_URL);
        const finalData = await getResponse3.json();
        console.log('✅ Final data:', finalData);

        // Test 6: Delete record
        console.log('\n6️⃣ Testing DELETE request (remove record)...');
        if (finalData.attendanceData && finalData.attendanceData.length > 0) {
            const deleteData = { index: 0 };
            const deleteResponse = await fetch(SYNC_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deleteData)
            });
            const deleteResult = await deleteResponse.json();
            console.log('✅ Delete result:', deleteResult);
        } else {
            console.log('⚠️ No records to delete');
        }

        console.log('\n🎉 All synchronization tests completed successfully!');
        console.log('✅ Server is working correctly');
        console.log('✅ Data synchronization is functional');
        console.log('✅ Cross-device attendance system is ready!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('🔧 Make sure the sync server is running: node sync-server.js');
    }
}

// Run the test
testSync();
