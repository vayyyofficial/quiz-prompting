/**
 * QUIZ CONFIGURATION
 * -------------------------------------------------------------
 * File ini berisi seluruh pengaturan kompetisi dan daftar pertanyaan.
 */

const QUIZ_CONFIG = {
  // Informasi Kompetisi
  competitionTitle: "Moklet Mengajar Quiz Competition",
  competitionSubtitle: "Official Knowledge Competition Portal",
  competitionDescription: "Uji wawasan, ketepatan, dan kerja sama tim Anda dalam kompetisi interaktif berstandar profesional.",
  
  // Pengaturan Suara Default (true = aktif, false = nonaktif)
  soundEnabledDefault: true,

  // Pengaturan Batas Waktu Menjawab (dalam detik)
  timerSettings: {
    single: 15,    // 15 detik untuk Single Answer
    multiple: 30   // 30 detik untuk Multiple Answer
  },

  // Petunjuk Umum Penilaian
  scoringGuidelines: {
    singleAnswerNote: "Single Answer: Pilih satu jawaban terbaik dalam 15 detik. Setiap jawaban benar bernilai 100 poin.",
    multipleAnswerNote: "Multiple Answer: Pilih semua jawaban yang benar dalam 30 detik. Penilaian proporsional berdasarkan jawaban benar dikurangi jawaban salah."
  },

  // Daftar 10 Pertanyaan Resmi
  questions: [
    // BAGIAN 1 — PILIHAN GANDA (SINGLE ANSWER) - 15 DETIK
    {
      id: 1,
      type: "single",
      question: "Apa itu Generative AI?",
      options: [
        { id: "A", text: "Robot fisik yang bisa berjalan dan membersihkan kelas." },
        { id: "B", text: "Teknologi kecerdasan buatan yang bisa membuat konten baru (teks, gambar, musik) secara otomatis." },
        { id: "C", text: "Aplikasi edit foto biasa yang hanya bisa memotong gambar." },
        { id: "D", text: "Mesin pencari di internet yang hanya bisa mencari link." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Generative AI adalah teknologi kecerdasan buatan yang mampu menciptakan konten orisinal baru seperti teks, gambar, kode, dan musik berdasarkan instruksi yang diberikan."
    },
    {
      id: 2,
      type: "single",
      question: "Manakah yang termasuk contoh layanan Generative AI?",
      options: [
        { id: "A", text: "Microsoft Excel" },
        { id: "B", text: "ChatGPT" },
        { id: "C", text: "Kalkulator HP" },
        { id: "D", text: "Google Maps" }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "ChatGPT adalah model bahasa berbasis Generative AI yang dapat menghasilkan teks dan percakapan interaktif."
    },
    {
      id: 3,
      type: "single",
      question: "Dalam materi dijelaskan bahwa \"Prompt\" itu ibarat...",
      options: [
        { id: "A", text: "Kabel penghubung internet." },
        { id: "B", text: "Jembatan antara ide kita dengan hasil yang dibuat AI." },
        { id: "C", text: "Baterai tambahan untuk komputer." },
        { id: "D", text: "Nama lain dari program komputer." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Prompt berfungsi sebagai jembatan komunikatif untuk menerjemahkan ide atau instruksi manusia agar dapat dipahami dan diwujudkan oleh AI."
    },
    {
      id: 4,
      type: "single",
      question: "Manakah yang merupakan ciri-ciri \"Prompt yang Baik\"?",
      options: [
        { id: "A", text: "Sangat singkat dan umum, misalnya: \"Buatkan cerita.\"" },
        { id: "B", text: "Jelas, spesifik, dan memiliki konteks yang lengkap." },
        { id: "C", text: "Menggunakan bahasa alien agar AI bingung." },
        { id: "D", text: "Tidak perlu menentukan format atau gaya." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Prompt yang efektif selalu memiliki instruksi yang jelas, detail spesifik, serta konteks dan format keluaran yang lengkap."
    },
    {
      id: 5,
      type: "single",
      question: "Jika AI sudah membuatkan website untuk kita, apakah hasilnya pasti langsung sempurna?",
      options: [
        { id: "A", text: "Ya, pasti langsung sempurna tanpa ada salah." },
        { id: "B", text: "Tidak, hasil pertama belum tentu sempurna dan perlu diperiksa serta diperbaiki." },
        { id: "C", text: "Ya, asalkan kita membayar lebih mahal." },
        { id: "D", text: "Tidak, karena AI tidak bisa membuat website sama sekali." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Hasil generasi pertama seringkali membutuhkan evaluasi, penyesuaian, dan perbaikan (iterasi) oleh manusia untuk mencapai hasil optimal."
    },
    {
      id: 6,
      type: "single",
      question: "Apa yang dimaksud dengan \"Token\" dalam penggunaan AI?",
      options: [
        { id: "A", text: "Koin virtual untuk membeli pulsa internet." },
        { id: "B", text: "Potongan teks yang diproses AI; makin panjang obrolan, makin cepat kuota habis." },
        { id: "C", text: "Tombol rahasia untuk mematikan komputer." },
        { id: "D", text: "Nama lain dari kabel charger laptop." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Token adalah unit potongan kata atau karakter yang dibaca dan diproses oleh model AI dalam jendela konteks percakapan."
    },
    {
      id: 7,
      type: "single",
      question: "Saat kita ingin memperbaiki website buatan AI, misalnya ingin memperbesar teks jadwal, apa yang sebaiknya kita lakukan agar hemat kuota/token?",
      options: [
        { id: "A", text: "Minta AI merombak seluruh kode dan mengganti semua tampilan website." },
        { id: "B", Meminta: "Meminta AI mengubah bagian teks jadwal saja secara spesifik.", text: "Meminta AI mengubah bagian teks jadwal saja secara spesifik." },
        { id: "C", text: "Menghapus website lalu membuat ulang dari nol." },
        { id: "D", text: "Membiarkannya saja karena teks kecil itu bagus." }
      ],
      correctAnswers: ["B"],
      points: 100,
      timeLimit: 15,
      explanation: "Memberikan instruksi perbaikan terfokus pada elemen spesifik menghemat pemakaian token dan mencegah perubahan yang tidak diinginkan pada bagian lain."
    },

    // BAGIAN 2 — PILIHAN GANDA KOMPLEKS (MULTIPLE ANSWER) - 30 DETIK
    {
      id: 8,
      type: "multiple",
      question: "Manakah dari pernyataan berikut yang BENAR tentang cara kerja Generative AI? (Pilih 2 jawaban)",
      options: [
        { id: "A", text: "AI memproses instruksi (prompt) yang diberikan oleh pengguna." },
        { id: "B", text: "AI mencuri data rahasia dari komputer kita tanpa izin." },
        { id: "C", text: "AI menggunakan pola dari data pelatihan untuk menghasilkan output (konten)." },
        { id: "D", text: "AI hanya bisa bekerja jika kita mengetik kode program yang rumit." }
      ],
      correctAnswers: ["A", "C"],
      points: 100,
      timeLimit: 30,
      explanation: "Generative AI bekerja dengan memahami prompt pengguna dan menggunakan pola statistik yang dipelajari selama proses training untuk menghasilkan output yang relevan."
    },
    {
      id: 9,
      type: "multiple",
      question: "Berdasarkan materi \"AI Prompting untuk Website\", manakah tips menulis instruksi yang efektif agar hasilnya bagus? (Pilih 2 jawaban)",
      options: [
        { id: "A", text: "Menjelaskan detail dan posisi elemen dengan jelas (misal: \"Letakkan tombol di atas\")." },
        { id: "B", text: "Meminta AI mengerjakan semua fitur paling rumit sekaligus dalam satu kali perintah." },
        { id: "C", text: "Memberikan contoh bentuk yang familiar (misal: \"Bikin kartu mirip widget kalender HP\")." },
        { id: "D", text: "Membiarkan AI menebak-nebak sendiri apa yang kita mau agar hasilnya mengejutkan." }
      ],
      correctAnswers: ["A", "C"],
      points: 100,
      timeLimit: 30,
      explanation: "Menyediakan detail posisi elemen yang jelas serta analogi/contoh bentuk konkret sangat membantu AI memahami layout dan komponen yang diinginkan."
    },
    {
      id: 10,
      type: "multiple",
      question: "Saat membuat website dengan bantuan AI, ada 5 unsur penting dalam prompt. Manakah di bawah ini yang termasuk unsur penting tersebut? (Pilih 3 jawaban)",
      options: [
        { id: "A", text: "Tujuan website dibuat." },
        { id: "B", text: "Jumlah followers media sosial pembuatnya." },
        { id: "C", text: "Pengguna/audiens utama website." },
        { id: "D", text: "Desain (nuansa warna & gaya)." },
        { id: "E", text: "Harga kuota internet yang dipakai." }
      ],
      correctAnswers: ["A", "C", "D"],
      points: 100,
      timeLimit: 30,
      explanation: "Tujuan website, target pengguna/audiens, dan spesifikasi desain (gaya & warna) adalah pilar esensial dalam merumuskan prompt pembuatan website."
    }
  ]
};

// Validasi struktur konfigurasi saat inisialisasi
function validateQuizConfig(config) {
  const errors = [];
  if (!config || !Array.isArray(config.questions) || config.questions.length === 0) {
    errors.push("Daftar pertanyaan tidak boleh kosong.");
    return { isValid: false, errors };
  }

  config.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    if (!q.id) errors.push(`Soal #${qNum}: Wajib memiliki ID.`);
    if (!q.question || typeof q.question !== "string" || !q.question.trim()) {
      errors.push(`Soal #${qNum}: Teks pertanyaan tidak boleh kosong.`);
    }
    if (!["single", "multiple"].includes(q.type)) {
      errors.push(`Soal #${qNum}: Tipe soal harus 'single' atau 'multiple'.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`Soal #${qNum}: Minimal harus memiliki 2 pilihan jawaban.`);
    } else {
      const optionIds = q.options.map(o => o.id);
      const uniqueIds = new Set(optionIds);
      if (uniqueIds.size !== optionIds.length) {
        errors.push(`Soal #${qNum}: ID opsi jawaban harus unik.`);
      }
    }
    if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
      errors.push(`Soal #${qNum}: Kunci jawaban tidak boleh kosong.`);
    } else if (q.type === "single" && q.correctAnswers.length !== 1) {
      errors.push(`Soal #${qNum}: Soal tipe 'single' harus memiliki tepat 1 kunci jawaban.`);
    }
    if (typeof q.points !== "number" || q.points <= 0) {
      errors.push(`Soal #${qNum}: Poin harus berupa angka positif.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
