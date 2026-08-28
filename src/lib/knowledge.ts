export const SIMPEG_KNOWLEDGE_BASE = [
  // --- TENTANG SISTEM & UMUM ---
  {
    keywords: ["apa", "simpeg", "sistem", "ini", "stikes", "baktara"],
    answer: "SIMPEG STIKES Baktara adalah Sistem Informasi Kepegawaian terpadu untuk mengelola presensi, arsip dokumen, laporan kinerja (BKD), dan data profil pegawai/dosen."
  },
  {
    keywords: ["siapa", "buat", "developer", "pengembang"],
    answer: "Sistem ini dikembangkan secara khusus untuk kebutuhan manajemen SDM di STIKES Baktara."
  },
  {
    keywords: ["halo", "hai", "pagi", "siang", "sore", "malam", "bantu"],
    answer: "Halo! Saya Asisten Virtual SIMPEG STIKES Baktara. Anda bisa bertanya tentang Presensi, Dokumen, BKD, atau Sinkronisasi SISTER."
  },
  
  // --- PRESENSI / ABSENSI ---
  {
    keywords: ["cara", "absen", "presensi", "hadir", "masuk", "pulang"],
    answer: "Untuk melakukan presensi:\n1. Buka menu 'Kehadiran' di sidebar.\n2. Sistem akan meminta izin akses kamera.\n3. Posisikan wajah Anda di lingkaran kamera.\n4. Klik tombol bulat untuk mengambil foto selfie (Face Recognition).\nSistem akan otomatis mencatat jam masuk/pulang Anda."
  },
  {
    keywords: ["nfc", "kartu", "tap", "mesin"],
    answer: "Fitur presensi menggunakan Kartu NFC saat ini telah dinonaktifkan dari website. Anda cukup menggunakan kamera (Selfie) untuk absen. Jika ada mesin sidik jari di kantor, data dari mesin tersebut juga terintegrasi otomatis ke sistem ini."
  },
  {
    keywords: ["rekap", "riwayat", "lihat absen", "kehadiran saya"],
    answer: "Anda bisa melihat riwayat kehadiran Anda di menu 'Kehadiran' (scroll ke bawah) atau di menu 'Rekap Presensi'. Di sana terdapat daftar jam masuk, jam pulang, dan status keterlambatan."
  },

  // --- SISTER & SINKRONISASI ---
  {
    keywords: ["sister", "apa itu sister", "kemdikbud"],
    answer: "SISTER (Sistem Informasi Sumber Daya Terintegrasi) adalah platform dari Kemdiktisaintek untuk mengelola portofolio Dosen (Pendidikan, Penelitian, Pengabdian, BKD)."
  },
  {
    keywords: ["cara", "sinkron", "sinkronisasi", "tarik data", "sister", "integrasi"],
    answer: "Untuk menarik data dari SISTER:\n1. Buka menu 'Pegawai'.\n2. Klik nama Anda (Dosen).\n3. Di pojok kanan atas, klik tombol 'Tarik Data SISTER'.\n(Catatan: Fitur ini membutuhkan Admin untuk memasukkan Kredensial API SISTER PT di menu Pengaturan terlebih dahulu)."
  },
  {
    keywords: ["kenapa", "gagal", "error", "sinkron", "sister", "api"],
    answer: "Jika sinkronisasi SISTER gagal, kemungkinan URL atau API Client ID/Secret yang dimasukkan oleh Admin di menu Pengaturan belum valid atau masa berlakunya habis. Silakan hubungi Admin via menu 'Bantuan'."
  },

  // --- DOKUMEN & ARSIP ---
  {
    keywords: ["upload", "unggah", "dokumen", "berkas", "file", "ijazah", "sk"],
    answer: "Untuk mengunggah dokumen:\n1. Buka menu 'Dokumen'.\n2. Klik 'Upload Dokumen'.\n3. Isi formulir (Kategori, Judul, dll).\n4. Anda bisa memilih 'Upload File' (hanya PDF, maks 10MB) atau 'Link Repository' (Google Drive, dll)."
  },
  {
    keywords: ["cari", "filter", "kategori", "dokumen", "hilang"],
    answer: "Di halaman 'Dokumen', Anda bisa menggunakan kolom Pencarian atau dropdown Filter Kategori (misal: Pendidikan, Penelitian, Kepegawaian) untuk menemukan dokumen Anda dengan cepat."
  },

  // --- PROFIL & BKD ---
  {
    keywords: ["edit", "ubah", "profil", "biodata", "nama", "gelar"],
    answer: "Buka menu 'Pegawai' -> Pilih nama Anda -> Klik tombol 'Edit Profil' di kanan atas. Anda bisa mengubah biodata dasar, pendidikan, dan kontak di sana."
  },
  {
    keywords: ["bkd", "laporan bkd", "beban kerja dosen", "tri dharma"],
    answer: "Untuk Laporan BKD, buka menu 'Pegawai' -> Pilih profil Anda -> Klik 'Laporan BKD'. Sistem akan mengkalkulasi kegiatan Tridharma Anda (Pendidikan, Penelitian, Pengabdian) berdasarkan dokumen yang diunggah atau ditarik dari SISTER."
  },

  // --- BANTUAN & PASSWORD ---
  {
    keywords: ["lupa", "password", "sandi", "ganti", "reset"],
    answer: "Jika Anda lupa password atau ingin menggantinya:\n1. Buka menu 'Bantuan'.\n2. Klik 'Buat Tiket Baru'.\n3. Pilih kategori 'Masalah Akun / Password'.\n4. Tulis pesan permohonan reset password ke Admin."
  },
  {
    keywords: ["error", "bug", "rusak", "masalah", "bantuan", "tiket", "komplain"],
    answer: "Jika menemukan error pada sistem, silakan laporkan melalui menu 'Bantuan'. Buat tiket baru dengan kategori 'Kendala Teknis' dan jelaskan secara detail. Tim Admin akan membalas tiket Anda."
  }
];

export function findBestAnswer(question: string): string {
  const lowerQ = question.toLowerCase();
  
  let bestMatch = null;
  let highestScore = 0;

  for (const item of SIMPEG_KNOWLEDGE_BASE) {
    let score = 0;
    
    // Hitung berapa banyak kata kunci yang cocok dengan pertanyaan
    for (const kw of item.keywords) {
      if (lowerQ.includes(kw)) {
        score++;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Jika skor minimal 1, berikan jawaban tersebut
  if (highestScore > 0 && bestMatch) {
    return bestMatch.answer;
  }

  return "Maaf, saya belum memahami pertanyaan Anda. Cobalah gunakan kata kunci seperti 'cara absen', 'sinkron sister', 'upload dokumen', atau 'lupa password'. Jika butuh bantuan lebih lanjut, silakan buat tiket di menu Bantuan.";
}
