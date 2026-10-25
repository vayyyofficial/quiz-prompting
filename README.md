# Moklet Mengajar — Quiz Competition Website

Website **Quiz Competition** profesional, modern, minimalis, dan responsif yang dirancang untuk kompetisi kuis langsung (live event). Dibangun murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript murni** tanpa ketergantungan framework, database, atau build tools.

Website ini dapat dijalankan secara **100% offline** karena library pendukung ekspor gambar (`html2canvas.min.js`) dan sintesis efek suara (Web Audio API) telah tersimpan secara lokal dan mandiri.

---

## 📁 Struktur Project

```text
Quiz Moklet Mengajar/
├── index.html              # Struktur tampilan (Halaman Awal, Kuis Aktif, Hasil Akhir)
├── css/
│   └── style.css           # Desain visual, tema merah-putih, layout responsif & animasi
├── js/
│   ├── questions.js        # Konfigurasi kompetisi & daftar pertanyaan kuis
│   ├── html2canvas.min.js  # Library lokal untuk ekspor kartu hasil ke gambar PNG (100% Offline)
│   └── script.js           # Logika quiz, verifikasi 2-klik, rumus skor, feedback, & unduh PNG
├── assets/
│   └── icons/              # Folder aset ikon jika diperlukan
└── README.md               # Dokumentasi dan panduan penggunaan
```

---

## 🚀 Cara Menjalankan Website

Website ini sepenuhnya statis (*client-side only*). Anda dapat menjalankannya dengan beberapa cara:

### Cara 1: Langsung Buka di Browser (Paling Praktis)
1. Buka folder project di File Explorer.
2. Klik ganda file `index.html` untuk langsung membukanya di browser favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Cara 2: Menggunakan Local Server (Direkomendasikan untuk Event)
Jika Anda menggunakan VS Code atau terminal:
- **VS Code Live Server**: Klik kanan `index.html` → pilih **"Open with Live Server"**.
- **Python (PowerShell/CMD)**:
  ```powershell
  python -m http.server 8000
  ```
  Lalu buka `http://localhost:8000` di browser.

---

## ⚙️ Cara Mengubah Nama Kompetisi & Deskripsi

Buka file [`js/questions.js`](file:///c:/Code/Quiz%20Moklet%20Mengajar/js/questions.js) menggunakan teks editor. Pada bagian paling atas, sesuaikan variabel berikut:

```javascript
const QUIZ_CONFIG = {
  // Ubah judul kompetisi sesuai nama acara Anda:
  competitionTitle: "Moklet Mengajar Quiz Competition",

  // Ubah sub-judul:
  competitionSubtitle: "Official Knowledge Competition Portal",

  // Ubah deskripsi sambutan di halaman awal:
  competitionDescription: "Uji wawasan, ketepatan, dan kerja sama tim Anda dalam kompetisi interaktif berstandar profesional.",

  // Status suara default saat dibuka (true = menyala, false = mati):
  soundEnabledDefault: true,
  
  // ...
};
```

Perubahan akan langsung diterapkan di header, halaman awal, sertifikat hasil akhir, dan judul tab browser.

---

## 📝 Cara Menambah / Mengedit Soal

Seluruh materi pertanyaan dikelola di dalam array `questions` pada file [`js/questions.js`](file:///c:/Code/Quiz%20Moklet%20Mengajar/js/questions.js).

### Format 1: Soal Single Answer (1 Jawaban Benar)
```javascript
{
  id: 1,
  type: "single",                                // Tipe soal
  question: "Apa kepanjangan dari HTTP?",       // Teks pertanyaan
  options: [
    { id: "A", text: "Hypertext Transfer Protocol" },
    { id: "B", text: "High Text Technical Path" },
    { id: "C", text: "Host Transfer Tool Program" },
    { id: "D", text: "Hyperlink Testing Procedure" }
  ],
  correctAnswers: ["A"],                         // Tepat 1 kunci jawaban
  points: 100,                                   // Poin maksimal (default 100)
  explanation: "HTTP adalah protokol untuk transmisi berkas dokumen web."
}
```

### Format 2: Soal Multiple Answer (Bisa Lebih dari 1 Jawaban Benar)
```javascript
{
  id: 2,
  type: "multiple",                              // Tipe soal
  question: "Manakah bahasa pemrograman yang berjalan di sisi browser? (Pilih semua yang benar)",
  options: [
    { id: "A", text: "JavaScript" },
    { id: "B", text: "WebAssembly" },
    { id: "C", text: "C++ Native Driver" },
    { id: "D", text: "Python standard CPython" }
  ],
  correctAnswers: ["A", "B"],                    // Array jawaban yang benar
  points: 100,                                   // Poin maksimal
  explanation: "JavaScript dan WebAssembly didukung secara native oleh browser modern."
}
```

---

---

## ⏱️ Sistem Batas Waktu (Timer)

Setiap pertanyaan memiliki batas waktu menjawab dengan penghitungan mundur *real-time*:
- **Single Answer (Pilihan Ganda Biasa)**: **15 detik** per soal.
- **Multiple Answer (Pilihan Ganda Kompleks)**: **30 detik** per soal.

### Ketentuan Timer:
- Timer dimulai otomatis begitu soal selesai dimuat di layar.
- Indikator timer berupa badge angka (misal: `15s`, `14s`, ...) dengan efek visual yang berubah warna saat waktu menipis (kuning saat $\le 5$s dan merah berkedip saat $\le 2$s).
- Timer langsung berhenti ketika peserta mengonfirmasi jawaban (*Confirm* atau *Verify Answers*).
- Jika waktu habis sebelum konfirmasi:
  - Jawaban dianggap tidak terjawab dan bernilai **0 poin**.
  - Seluruh pilihan dikunci otomatis sehingga tidak dapat dipilih atau dikirim lagi.
  - Tampil feedback `Time's Up! ⏰` beserta kunci jawaban yang benar.
  - Tombol `Next Question` (atau `Finish Quiz`) muncul agar peserta dapat melanjutkan.

---

## 🧮 Sistem Penilaian

1. **Single Answer (15 Detik)**:
   - Menjawab Benar sebelum waktu habis = Nilai Penuh (100 Poin default).
   - Menjawab Salah atau Kehabisan Waktu (Timeout) = 0 Poin.

2. **Multiple Answer (30 Detik — Penilaian Parsial dengan Penalti Salah Pilih)**:
   - Rumus:
     $$\text{Skor} = \max\left(0, \text{Poin Maksimal} \times \frac{\text{Benar Dipilih} - \text{Salah Dipilih}}{\text{Total Jawaban Benar}}\right)$$
   - Skor selalu dibatasi antara 0 sampai Poin Maksimal soal (100 Poin) dan dibulatkan rapi.
   - Kehabisan waktu sebelum menekan tombol *Verify Answers* menghasilkan **0 poin**.
   - Dihitung sebagai "Jawaban Benar" pada ringkasan statistik hanya jika seluruh jawaban benar dipilih tanpa ada opsi salah yang terpilih (100% tepat).

---

## 🖨️ Fitur Ekspor Hasil (Print Result ke PNG)

- Pada akhir quiz, peserta melihat **Kartu Skor Resmi (Official Score Certificate)** yang memuat:
  - Judul kompetisi & logo.
  - Nama tim peserta.
  - Total skor perolehan dan total skor maksimal (misal: `850 / 1,000 Points`).
  - Persentase akurasi.
  - Rincian jumlah soal, jawaban benar, dan jawaban salah/parsial.
  - Waktu penyelesaian resmi (WIB).
  - Nomor serial verifikasi sistem.
- Menekan tombol **"Print Result (Download PNG)"** akan otomatis merender kartu sertifikat menjadi gambar PNG resolusi tinggi (*retina scale: 2x*) dan mengunduhnya dengan nama file rapi:
  `quiz-result-Nama-Tim.png`.
- Tombol navigasi dan antarmuka web tidak ikut tercetak ke dalam gambar sehingga kartu hasil tampak bersih dan formal untuk diserahkan kepada juri.

---

## 🛡️ Alur Penggunaan & Pencegahan Bug

- **Mekanisme 2-Klik (Single Answer)**: Klik pertama memilih opsi jawaban (dapat diganti kapan saja sebelum dikonfirmasi). Tombol "Confirm" muncul di opsi terpilih untuk mengunci jawaban final.
- **Pencegahan Double-Click & Double-Submit**: Setelah diverifikasi, seluruh opsi jawaban langsung dikunci sehingga skor tidak dapat terhitung ganda.
- **Pencegahan Berpindah Tanpa Menjawab**: Tombol "Next Question" hanya muncul setelah jawaban dikonfirmasi dan peserta telah membaca feedback penjelasan.
- **Konfirmasi Sesi Baru**: Tombol "Mulai Sesi Baru" dilengkapi modal konfirmasi agar skor peserta tidak terhapus tanpa sengaja sebelum sempat diunduh.
- **Efek Suara Mandiri**: Efek suara disintesis secara dinamis menggunakan Web Audio API internal browser. Tidak membutuhkan file audio eksternal dan dapat dinonaktifkan sewaktu-waktu melalui tombol di header.
