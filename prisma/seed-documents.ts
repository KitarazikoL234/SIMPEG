import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📄 Menambahkan data dummy dokumen...');

  // Ambil semua employee yang ada
  const employees = await prisma.employee.findMany({ orderBy: { createdAt: 'asc' } });
  const users = await prisma.user.findMany();

  if (employees.length === 0) {
    console.log('❌ Tidak ada data pegawai! Jalankan seed utama dulu: npx ts-node prisma/seed.ts');
    return;
  }

  const uploaderId = users[0]?.id ?? null;

  // Hapus dokumen lama agar tidak duplikat
  await prisma.document.deleteMany();
  console.log('🗑️  Dokumen lama dihapus');

  const docs: any[] = [];

  // ============================
  // EMPLOYEE 0 - Dr. Ahmad Fauzi
  // ============================
  if (employees[0]) {
    const eId = employees[0].id;
    docs.push(
      // PENDIDIKAN
      { judul: 'SK Mengajar Keperawatan Medikal Bedah Sem. Ganjil 2025/2026', nomorDokumen: 'SK/KMB/001/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kmb-001', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Metodologi Penelitian Keperawatan Sem. Ganjil 2025/2026', nomorDokumen: 'SK/METPEN/002/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-metpen-002', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar KMB Sem. Genap 2024/2025', nomorDokumen: 'SK/KMB/012/II/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-02-10'), masaBerlaku: new Date('2025-08-31'), semester: 'Genap', tahunAkademik: '2024/2025', status: 'ARSIP', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kmb-012', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pembimbing Skripsi Mahasiswa Angkatan 2022', nomorDokumen: 'SK/BIMBING/015/VIII/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_PEMBIMBING', tanggalTerbit: new Date('2025-08-15'), masaBerlaku: new Date('2026-07-31'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-bimbing-015', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Penguji Sidang Skripsi Periode Juli 2025', nomorDokumen: 'SK/PENGUJI/007/VII/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_PENGUJI', tanggalTerbit: new Date('2025-07-01'), masaBerlaku: new Date('2025-07-31'), semester: 'Genap', tahunAkademik: '2024/2025', status: 'ARSIP', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-penguji-007', employeeId: eId, uploadedById: uploaderId },
      // PENELITIAN
      { judul: 'SK Ketua Peneliti - Hibah Dikti 2025 (Pengaruh Early Mobilization)', nomorDokumen: 'SK/PENELITIAN/003/III/2025', kategoriUtama: 'PENELITIAN', subKategori: 'SK_PENELITIAN', tanggalTerbit: new Date('2025-03-15'), masaBerlaku: new Date('2025-12-31'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-riset-003', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Artikel: Efektivitas Terapi Musik pada Pasien ICU - Jurnal Keperawatan Indonesia', nomorDokumen: 'JKI/2025/Vol12/045', kategoriUtama: 'PENELITIAN', subKategori: 'PUBLIKASI_JURNAL', tanggalTerbit: new Date('2025-04-20'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://jurnal.stikes-baktara.ac.id/jki/045', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Penelitian Internal - Analisis Burnout Perawat RS 2024', nomorDokumen: 'SK/PENELITIAN/022/IV/2024', kategoriUtama: 'PENELITIAN', subKategori: 'SK_PENELITIAN', tanggalTerbit: new Date('2024-04-01'), masaBerlaku: new Date('2024-12-31'), status: 'ARSIP', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-riset-022-2024', employeeId: eId, uploadedById: uploaderId },
      // PENGABDIAN
      { judul: 'Sertifikat Pemateri Seminar Nasional Keperawatan - Jakarta', nomorDokumen: 'SERT/SEM-NAS/2025/456', kategoriUtama: 'PENGABDIAN', subKategori: 'SERTIFIKAT_PEMATERI', tanggalTerbit: new Date('2025-06-15'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-semnas-456', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pengabdian Masyarakat - Penyuluhan PHBS Desa Tugurejo', nomorDokumen: 'SK/ABDIMAS/011/VII/2025', kategoriUtama: 'PENGABDIAN', subKategori: 'SK_PENGABDIAN', tanggalTerbit: new Date('2025-07-10'), masaBerlaku: new Date('2025-09-30'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-abdimas-011', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Laporan Pengabdian: Pelatihan BHD Kader Posyandu Kediri', nomorDokumen: 'LAPORAN/ABDIMAS/2024/089', kategoriUtama: 'PENGABDIAN', subKategori: 'LAPORAN_PENGABDIAN', tanggalTerbit: new Date('2024-11-30'), status: 'ARSIP', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/laporan-abdimas-089', employeeId: eId, uploadedById: uploaderId },
      // PENUNJANG
      { judul: 'Surat Tugas Seminar Nasional Keperawatan - Jakarta 2025', nomorDokumen: 'ST/2025/VI/089', kategoriUtama: 'PENUNJANG', subKategori: 'SURAT_TUGAS', tanggalTerbit: new Date('2025-06-10'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/st-089', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Kepanitiaan Dies Natalis ke-12 STIKES Baktara', nomorDokumen: 'SK/PANITIA/002/V/2025', kategoriUtama: 'PENUNJANG', subKategori: 'SK_KEPANITIAAN', tanggalTerbit: new Date('2025-05-01'), masaBerlaku: new Date('2025-09-30'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-panitia-002', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pelatihan Basic Life Support (BLS) - 2024', nomorDokumen: 'SERT/BLS/2024/789', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2024-08-15'), masaBerlaku: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 20), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-bls-789', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat TOEFL ITP Score 520 - British Council', nomorDokumen: 'TOEFL/BC/2024/321', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2024-05-20'), masaBerlaku: new Date('2026-05-20'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/toefl-bc-321', employeeId: eId, uploadedById: uploaderId },
      // KEPEGAWAIAN
      { judul: 'SK Pengangkatan sebagai Dosen Tetap Yayasan', nomorDokumen: 'SK/ANGKAT/001/I/2010', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2010-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-angkat-001', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Kenaikan Jabatan Fungsional - Lektor Kepala', nomorDokumen: 'SK/JAB/056/IV/2020', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_JABATAN', tanggalTerbit: new Date('2020-04-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-jab-056', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pendidik (Serdos) - Dikti', nomorDokumen: 'SERDOS-2018-001234', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SERTIFIKAT_PENDIDIK', tanggalTerbit: new Date('2018-12-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/serdos-001234', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 1 - Siti Nurhaliza
  // ============================
  if (employees[1]) {
    const eId = employees[1].id;
    docs.push(
      { judul: 'SK Mengajar Keperawatan Dasar Sem. Ganjil 2025/2026', nomorDokumen: 'SK/KEPDAT/003/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kepdat-003', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Etika Keperawatan Sem. Ganjil 2025/2026', nomorDokumen: 'SK/ETIKA/004/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-etika-004', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pembimbing Praktek Klinik Rumah Sakit 2025', nomorDokumen: 'SK/BIMKLINIK/009/VIII/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_PEMBIMBING', tanggalTerbit: new Date('2025-08-01'), masaBerlaku: new Date('2025-12-31'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-bimklinik-009', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Penelitian - Hubungan Caring Behavior Perawat dengan Kepuasan Pasien', nomorDokumen: 'SK/PENELITIAN/018/V/2025', kategoriUtama: 'PENELITIAN', subKategori: 'SK_PENELITIAN', tanggalTerbit: new Date('2025-05-01'), masaBerlaku: new Date('2025-12-31'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-riset-018', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Peserta Workshop Keperawatan Digital & Telemedicine', nomorDokumen: 'SERT/WS/2025/KD/123', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2025-07-20'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-ws-123', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Surat Tugas Asesor BAN-PT Visitasi Akreditasi', nomorDokumen: 'ST/BANPT/2025/045', kategoriUtama: 'PENUNJANG', subKategori: 'SURAT_TUGAS', tanggalTerbit: new Date('2025-08-10'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/st-banpt-045', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pengangkatan sebagai Dosen Tetap', nomorDokumen: 'SK/ANGKAT/012/I/2015', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2015-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-angkat-012', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pendidik (Serdos) - Kemendikbud 2020', nomorDokumen: 'SERDOS-2020-005678', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SERTIFIKAT_PENDIDIK', tanggalTerbit: new Date('2020-06-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/serdos-005678', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 2 - Bambang Setiawan
  // ============================
  if (employees[2]) {
    const eId = employees[2].id;
    docs.push(
      { judul: 'SK Mengajar Epidemiologi Sem. Ganjil 2025/2026', nomorDokumen: 'SK/EPID/005/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-epid-005', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Promosi Kesehatan Sem. Ganjil 2025/2026', nomorDokumen: 'SK/PROMKES/006/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-promkes-006', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pembimbing KKN Mahasiswa Prodi Kesehatan Masyarakat 2025', nomorDokumen: 'SK/KKN/019/VII/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_PEMBIMBING', tanggalTerbit: new Date('2025-07-01'), masaBerlaku: new Date('2025-09-30'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kkn-019', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pengabdian - Penyuluhan Sanitasi Lingkungan Kec. Mojoroto', nomorDokumen: 'SK/ABDIMAS/014/VI/2025', kategoriUtama: 'PENGABDIAN', subKategori: 'SK_PENGABDIAN', tanggalTerbit: new Date('2025-06-01'), masaBerlaku: new Date('2025-08-31'), status: 'ARSIP', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-abdimas-014', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Webinar Kesehatan Lingkungan dan Perubahan Iklim', nomorDokumen: 'SERT/WEB/2025/KL/067', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2025-05-25'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-web-067', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pengangkatan sebagai Dosen Tetap', nomorDokumen: 'SK/ANGKAT/025/I/2012', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2012-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-angkat-025', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 3 - Dewi Ratnasari
  // ============================
  if (employees[3]) {
    const eId = employees[3].id;
    docs.push(
      { judul: 'SK Mengajar Farmakologi Klinik Sem. Ganjil 2025/2026', nomorDokumen: 'SK/FARMAKOL/007/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-farmakol-007', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Fitokimia Sem. Ganjil 2025/2026', nomorDokumen: 'SK/FITO/008/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-fito-008', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Penelitian - Formulasi Tablet Herbal Ekstrak Daun Sirsak', nomorDokumen: 'SK/PENELITIAN/031/IV/2025', kategoriUtama: 'PENELITIAN', subKategori: 'SK_PENELITIAN', tanggalTerbit: new Date('2025-04-15'), masaBerlaku: new Date('2025-12-31'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-riset-031', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pelatihan Good Manufacturing Practice (GMP) - BPOM', nomorDokumen: 'SERT/GMP/BPOM/2024/112', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2024-10-10'), masaBerlaku: new Date('2027-10-10'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-gmp-112', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Pengangkatan sebagai Dosen Tetap', nomorDokumen: 'SK/ANGKAT/037/IX/2018', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2018-09-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-angkat-037', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 4 - Eko Prasetyo (TENDIK)
  // ============================
  if (employees[4]) {
    const eId = employees[4].id;
    docs.push(
      { judul: 'SK Pengangkatan sebagai Kepala Bagian IT', nomorDokumen: 'SK/KABIT/001/I/2020', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_JABATAN', tanggalTerbit: new Date('2020-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kabit-001', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pelatihan Keamanan Siber - BSSN 2025', nomorDokumen: 'SERT/BSSN/2025/089', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2025-03-15'), masaBerlaku: new Date('2028-03-15'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-bssn-089', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat AWS Cloud Practitioner', nomorDokumen: 'SERT/AWS/2024/CP/567', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2024-06-01'), masaBerlaku: new Date('2027-06-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://aws.amazon.com/verify/sert-cp-567', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Surat Tugas Implementasi SIMPEG STIKES Baktara', nomorDokumen: 'ST/IT/2025/001', kategoriUtama: 'PENUNJANG', subKategori: 'SURAT_TUGAS', tanggalTerbit: new Date('2025-01-10'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/st-simpeg-001', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 5 - Rina Wulandari (TENDIK Keuangan)
  // ============================
  if (employees[5]) {
    const eId = employees[5].id;
    docs.push(
      { judul: 'SK Pengangkatan sebagai Staf Keuangan', nomorDokumen: 'SK/KEUANGAN/003/I/2019', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2019-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-keu-003', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pelatihan Akuntansi Keuangan Perguruan Tinggi - BPKP', nomorDokumen: 'SERT/BPKP/2024/AK/234', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2024-11-20'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-bpkp-234', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Bendahara Penerimaan - Kemenkeu', nomorDokumen: 'SERT/KEMEN/2023/BEN/890', kategoriUtama: 'PENUNJANG', subKategori: 'SERTIFIKAT_PELATIHAN', tanggalTerbit: new Date('2023-08-15'), masaBerlaku: new Date('2026-08-15'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sert-ben-890', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // ============================
  // EMPLOYEE 7 - Dr. Indah Permata Sari
  // ============================
  if (employees[7]) {
    const eId = employees[7].id;
    docs.push(
      { judul: 'SK Ketua Program Studi Keperawatan Periode 2024-2028', nomorDokumen: 'SK/KAPRODI/001/I/2024', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_JABATAN', tanggalTerbit: new Date('2024-01-01'), masaBerlaku: new Date('2028-01-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kaprodi-001', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Keperawatan Jiwa Sem. Ganjil 2025/2026', nomorDokumen: 'SK/KEPJIWA/009/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-kepjiwa-009', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Mengajar Keperawatan Gerontik Sem. Ganjil 2025/2026', nomorDokumen: 'SK/GERONTIK/010/IX/2025', kategoriUtama: 'PENDIDIKAN', subKategori: 'SK_MENGAJAR', tanggalTerbit: new Date('2025-09-01'), masaBerlaku: new Date('2026-02-28'), semester: 'Ganjil', tahunAkademik: '2025/2026', status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-gerontik-010', employeeId: eId, uploadedById: uploaderId },
      { judul: 'SK Penelitian - Faktor Resiko Demensia Lansia di Panti Kediri', nomorDokumen: 'SK/PENELITIAN/025/III/2025', kategoriUtama: 'PENELITIAN', subKategori: 'SK_PENELITIAN', tanggalTerbit: new Date('2025-03-01'), masaBerlaku: new Date('2025-12-31'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/sk-riset-025', employeeId: eId, uploadedById: uploaderId },
      { judul: 'Sertifikat Pendidik (Serdos) - Kemendikbud 2019', nomorDokumen: 'SERDOS-2019-003456', kategoriUtama: 'KEPEGAWAIAN', subKategori: 'SK_PENGANGKATAN', tanggalTerbit: new Date('2019-12-01'), status: 'AKTIF', tipeFile: 'LINK', linkRepository: 'https://drive.google.com/file/d/serdos-003456', employeeId: eId, uploadedById: uploaderId },
    );
  }

  // Insert semua dokumen
  let count = 0;
  for (const doc of docs) {
    await prisma.document.create({ data: doc });
    count++;
  }

  console.log(`✅ ${count} dokumen dummy berhasil dibuat!`);
  console.log('\nRincian per pegawai:');
  employees.forEach((emp, i) => {
    const empDocs = docs.filter(d => d.employeeId === emp.id);
    if (empDocs.length > 0) console.log(`  - ${emp.nama}: ${empDocs.length} dokumen`);
  });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
