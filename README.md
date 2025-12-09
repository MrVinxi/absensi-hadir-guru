# Sistem Absensi Guru SMK Muhammadiyah 1 Pandaan

Sistem absensi digital untuk guru SMK Muhammadiyah 1 Pandaan dengan sinkronisasi real-time antar perangkat.

## 🚀 Fitur Utama

- ✅ **Penyimpanan JSON**: Data tersimpan dalam format JSON yang mudah dibaca
- ✅ **Timer Otomatis**: Absensi otomatis tertutup setelah 1 jam
- ✅ **Dashboard Admin**: Kelola absensi dengan mudah
- ✅ **Export Data**: Simpan data ke file JSON atau CSV
- ✅ **Responsive Design**: Tampil sempurna di semua perangkat
- ✅ **Mudah Digunakan**: Tidak perlu setup database kompleks

## 📋 Persyaratan

- Browser modern (Chrome, Firefox, Safari, Edge)
- Tidak perlu koneksi internet (offline-first)
- Tidak perlu setup database kompleks

## 🔧 Setup Firebase (Wajib untuk Sinkronisasi)

### 1. Buat Firebase Project
1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Create a project" atau "Tambah project"
3. Masukkan nama project: `absensi-guru-smk`
4. Ikuti langkah-langkah setup sampai selesai

### 2. Aktifkan Realtime Database
1. Di menu sebelah kiri, pilih "Realtime Database"
2. Klik "Create Database"
3. Pilih "Start in test mode" (untuk development)
4. Klik "Done"

### 3. Dapatkan Konfigurasi Firebase
1. Klik ikon gear ⚙️ > "Project settings"
2. Scroll ke bawah ke bagian "Your apps"
3. Klik ikon web `</>` untuk menambah web app
4. Masukkan nama app: `Absensi Guru SMK`
5. **PENTING**: Copy konfigurasi yang muncul:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "absensi-guru-smk.firebaseapp.com",
  databaseURL: "https://absensi-guru-smk-default-rtdb.firebaseio.com",
  projectId: "absensi-guru-smk",
  storageBucket: "absensi-guru-smk.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Update Konfigurasi di Kode
1. Buka file `index.html` dan `admin.html`
2. Ganti bagian `firebaseConfig` dengan konfigurasi Anda:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // GANTI DENGAN API KEY ANDA
    authDomain: "absensi-guru-smk.firebaseapp.com",
    databaseURL: "https://absensi-guru-smk-default-rtdb.firebaseio.com",
    projectId: "absensi-guru-smk",
    storageBucket: "absensi-guru-smk.appspot.com",
    messagingSenderId: "123456789", // GANTI DENGAN SENDER ID ANDA
    appId: "1:123456789:web:abcdef123456" // GANTI DENGAN APP ID ANDA
};
```

## 📱 Cara Penggunaan

### Untuk Guru (Pengguna):
1. Buka `index.html` di browser
2. Tunggu admin membuka absensi
3. Isi nama lengkap dan pilih status kehadiran
4. Klik "Kirim Absensi"

### Untuk Admin:
1. Buka `admin.html`
2. Login dengan username: `admin`, password: `admin123`
3. Klik toggle untuk membuka/menutup absensi
4. Monitor data absensi real-time
5. Export data jika diperlukan

## 🔄 Sinkronisasi Antar Perangkat

Dengan Firebase, sistem ini sekarang **terhubung secara real-time**:

- ✅ **Status Absensi**: Jika admin buka di HP, langsung terlihat di laptop
- ✅ **Data Absensi**: Semua input guru langsung tersimpan dan terlihat di semua perangkat
- ✅ **Timer**: Hitungan mundur sinkron di semua device
- ✅ **Auto-Close**: Absensi otomatis tertutup di semua perangkat setelah 1 jam

## 📊 Export Data

Admin dapat menyimpan data dengan 2 cara:

### 1. Simpan ke File JSON
- Klik tombol "💾 Simpan Data"
- File akan terdownload dengan format: `absensi_guru_YYYY-MM-DD.json`

### 2. Download Laporan CSV
- Klik tombol "📊 Unduh Laporan"
- File Excel-ready: `laporan_absensi.csv`

## 🛠️ Troubleshooting

### Jika tidak tersinkron antar perangkat:
1. Pastikan Firebase sudah dikonfigurasi dengan benar
2. Periksa koneksi internet
3. Refresh halaman di semua perangkat

### Jika Firebase error:
1. Pastikan API key dan konfigurasi sudah benar
2. Periksa apakah Realtime Database sudah aktif
3. Buka browser console untuk melihat error detail

## 📞 Dukungan

Jika ada masalah, periksa:
- Browser console untuk error messages
- Koneksi internet
- Konfigurasi Firebase

---

**Dibuat untuk SMK Muhammadiyah 1 Pandaan**
