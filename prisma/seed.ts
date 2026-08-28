import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.document.deleteMany();
  await prisma.teachingHistory.deleteMany();
  await prisma.positionHistory.deleteMany();
  await prisma.educationHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  console.log('🗑️  Data lama dihapus');

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        nama: 'Ahmad Fauzi',
        gelarDepan: 'Dr.',
        gelarBelakang: 'M.Kes.',
        nip: '198501152010011001',
        nidn: '0715018501',
        tempatLahir: 'Kediri',
        tanggalLahir: new Date('1985-01-15'),
        jenisKelamin: 'LAKI_LAKI',
        agama: 'Islam',
        alamat: 'Jl. Mawar No. 10, Kediri, Jawa Timur',
        telepon: '081234567890',
        email: 'ahmad.fauzi@stikes-baktara.ac.id',
        tipeKepegawaian: 'DOSEN',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Program Studi Keperawatan',
        jabatanAkademik: 'Lektor Kepala',
        pangkat: 'Penata Tk. I',
        golongan: 'III/d',
        rumpunIlmu: 'Ilmu Keperawatan',
        sertifikasiPendidik: true,
        nomorSertifikasi: 'SERDOS-2018-001234',
        tmtPertama: new Date('2010-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Siti Nurhaliza',
        gelarBelakang: 'S.Kep., Ns., M.Kep.',
        nip: '199003202015012001',
        nidn: '0720039001',
        tempatLahir: 'Blitar',
        tanggalLahir: new Date('1990-03-20'),
        jenisKelamin: 'PEREMPUAN',
        agama: 'Islam',
        alamat: 'Jl. Melati No. 5, Blitar, Jawa Timur',
        telepon: '081298765432',
        email: 'siti.nurhaliza@stikes-baktara.ac.id',
        tipeKepegawaian: 'DOSEN',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Program Studi Keperawatan',
        jabatanAkademik: 'Lektor',
        pangkat: 'Penata',
        golongan: 'III/c',
        rumpunIlmu: 'Ilmu Keperawatan',
        sertifikasiPendidik: true,
        nomorSertifikasi: 'SERDOS-2020-005678',
        tmtPertama: new Date('2015-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Bambang Setiawan',
        gelarBelakang: 'S.KM., M.Kes.',
        nip: '198712102012011001',
        nidn: '0710128701',
        tempatLahir: 'Tulungagung',
        tanggalLahir: new Date('1987-12-10'),
        jenisKelamin: 'LAKI_LAKI',
        agama: 'Islam',
        alamat: 'Jl. Anggrek No. 15, Tulungagung, Jawa Timur',
        telepon: '082134567891',
        email: 'bambang.setiawan@stikes-baktara.ac.id',
        tipeKepegawaian: 'DOSEN',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Program Studi Kesehatan Masyarakat',
        jabatanAkademik: 'Asisten Ahli',
        pangkat: 'Penata Muda Tk. I',
        golongan: 'III/b',
        rumpunIlmu: 'Ilmu Kesehatan Masyarakat',
        sertifikasiPendidik: false,
        tmtPertama: new Date('2012-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Dewi Ratnasari',
        gelarBelakang: 'S.Farm., M.Farm., Apt.',
        nidn: '0705049201',
        tempatLahir: 'Kediri',
        tanggalLahir: new Date('1992-04-05'),
        jenisKelamin: 'PEREMPUAN',
        agama: 'Islam',
        alamat: 'Jl. Dahlia No. 8, Kediri, Jawa Timur',
        telepon: '085712345678',
        email: 'dewi.ratnasari@stikes-baktara.ac.id',
        tipeKepegawaian: 'DOSEN',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Program Studi Farmasi',
        jabatanAkademik: 'Tenaga Pengajar',
        rumpunIlmu: 'Ilmu Farmasi',
        sertifikasiPendidik: false,
        tmtPertama: new Date('2018-09-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Eko Prasetyo',
        gelarBelakang: 'S.Kom.',
        nip: '199205152018011001',
        tempatLahir: 'Nganjuk',
        tanggalLahir: new Date('1992-05-15'),
        jenisKelamin: 'LAKI_LAKI',
        agama: 'Islam',
        alamat: 'Jl. Kenanga No. 22, Nganjuk, Jawa Timur',
        telepon: '087812345678',
        email: 'eko.prasetyo@stikes-baktara.ac.id',
        tipeKepegawaian: 'TENDIK',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Bagian IT',
        jabatanStruktural: 'Kepala Bagian IT',
        pangkat: 'Penata Muda',
        golongan: 'III/a',
        tmtPertama: new Date('2018-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Rina Wulandari',
        gelarBelakang: 'S.E.',
        nip: '199308202019012001',
        tempatLahir: 'Kediri',
        tanggalLahir: new Date('1993-08-20'),
        jenisKelamin: 'PEREMPUAN',
        agama: 'Islam',
        alamat: 'Jl. Teratai No. 30, Kediri, Jawa Timur',
        telepon: '089612345678',
        email: 'rina.wulandari@stikes-baktara.ac.id',
        tipeKepegawaian: 'TENDIK',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Bagian Keuangan',
        jabatanStruktural: 'Staf Keuangan',
        pangkat: 'Pengatur Tk. I',
        golongan: 'II/d',
        tmtPertama: new Date('2019-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Wahyu Hidayat',
        gelarBelakang: 'A.Md.',
        tempatLahir: 'Trenggalek',
        tanggalLahir: new Date('1995-11-08'),
        jenisKelamin: 'LAKI_LAKI',
        agama: 'Islam',
        alamat: 'Jl. Cempaka No. 12, Trenggalek, Jawa Timur',
        telepon: '081345678912',
        email: 'wahyu.hidayat@stikes-baktara.ac.id',
        tipeKepegawaian: 'TENDIK',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Bagian Administrasi Akademik',
        jabatanStruktural: 'Staf Administrasi',
        tmtPertama: new Date('2020-03-01'),
      },
    }),
    prisma.employee.create({
      data: {
        nama: 'Indah Permata Sari',
        gelarDepan: 'Dr.',
        gelarBelakang: 'S.Kep., Ns., M.Kep.',
        nidn: '0712058801',
        tempatLahir: 'Kediri',
        tanggalLahir: new Date('1988-05-12'),
        jenisKelamin: 'PEREMPUAN',
        agama: 'Islam',
        alamat: 'Jl. Bougenville No. 7, Kediri, Jawa Timur',
        telepon: '082298765432',
        email: 'indah.permata@stikes-baktara.ac.id',
        tipeKepegawaian: 'DOSEN',
        statusKepegawaian: 'AKTIF',
        unitKerja: 'Program Studi Keperawatan',
        jabatanAkademik: 'Lektor',
        jabatanStruktural: 'Ketua Program Studi Keperawatan',
        pangkat: 'Penata',
        golongan: 'III/c',
        rumpunIlmu: 'Ilmu Keperawatan',
        sertifikasiPendidik: true,
        nomorSertifikasi: 'SERDOS-2019-003456',
        tmtPertama: new Date('2013-01-01'),
      },
    }),
  ]);

  console.log(`✅ ${employees.length} pegawai dibuat`);

  // Create users (linked to employees)
  const hashedPassword = await bcrypt.hash('123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin',
        password: hashedPassword,
        nama: 'Administrator',
        role: 'ADMIN',
        employeeId: employees[4].id, // Eko (IT)
      },
    }),
    prisma.user.create({
      data: {
        email: 'pimpinan',
        password: hashedPassword,
        nama: 'Pimpinan STIKES',
        role: 'PIMPINAN',
        employeeId: employees[5].id, // Rina (pretend to be Pimpinan for seed)
      },
    }),
    prisma.user.create({
      data: {
        email: 'dosen',
        password: hashedPassword,
        nama: 'Dr. Ahmad Fauzi, M.Kes.',
        role: 'DOSEN',
        employeeId: employees[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'tendik',
        password: hashedPassword,
        nama: 'Budi Santoso, S.Kom.',
        role: 'TENDIK',
        employeeId: employees[2].id, // Bambang -> pretend to be tendik for seed
      },
    }),
  ]);

  console.log(`✅ ${users.length} user dibuat`);

  // Create education history
  await Promise.all([
    // Ahmad Fauzi
    prisma.educationHistory.create({
      data: { employeeId: employees[0].id, jenjang: 'S1', institusi: 'Universitas Brawijaya', jurusan: 'Keperawatan', tahunMasuk: 2003, tahunLulus: 2007, nomorIjazah: 'S1-UB-2007-1234', ipk: 3.65 },
    }),
    prisma.educationHistory.create({
      data: { employeeId: employees[0].id, jenjang: 'S2', institusi: 'Universitas Airlangga', jurusan: 'Ilmu Kesehatan', tahunMasuk: 2009, tahunLulus: 2011, nomorIjazah: 'S2-UNAIR-2011-5678', ipk: 3.78 },
    }),
    prisma.educationHistory.create({
      data: { employeeId: employees[0].id, jenjang: 'S3', institusi: 'Universitas Gadjah Mada', jurusan: 'Ilmu Kedokteran & Kesehatan', tahunMasuk: 2015, tahunLulus: 2019, nomorIjazah: 'S3-UGM-2019-9012', ipk: 3.85 },
    }),
    // Siti
    prisma.educationHistory.create({
      data: { employeeId: employees[1].id, jenjang: 'S1', institusi: 'Universitas Airlangga', jurusan: 'Keperawatan', tahunMasuk: 2008, tahunLulus: 2012, nomorIjazah: 'S1-UNAIR-2012-3456', ipk: 3.55 },
    }),
    prisma.educationHistory.create({
      data: { employeeId: employees[1].id, jenjang: 'S2', institusi: 'Universitas Indonesia', jurusan: 'Keperawatan', tahunMasuk: 2014, tahunLulus: 2016, nomorIjazah: 'S2-UI-2016-7890', ipk: 3.72 },
    }),
  ]);

  console.log('✅ Riwayat pendidikan dibuat');

  // Create position history
  await Promise.all([
    prisma.positionHistory.create({
      data: { employeeId: employees[0].id, jabatan: 'Tenaga Pengajar', pangkat: 'Penata Muda', golongan: 'III/a', tmt: new Date('2010-01-01'), nomorSK: 'SK/001/I/2010' },
    }),
    prisma.positionHistory.create({
      data: { employeeId: employees[0].id, jabatan: 'Asisten Ahli', pangkat: 'Penata Muda Tk. I', golongan: 'III/b', tmt: new Date('2013-04-01'), nomorSK: 'SK/045/IV/2013' },
    }),
    prisma.positionHistory.create({
      data: { employeeId: employees[0].id, jabatan: 'Lektor', pangkat: 'Penata', golongan: 'III/c', tmt: new Date('2016-10-01'), nomorSK: 'SK/102/X/2016' },
    }),
    prisma.positionHistory.create({
      data: { employeeId: employees[0].id, jabatan: 'Lektor Kepala', pangkat: 'Penata Tk. I', golongan: 'III/d', tmt: new Date('2020-04-01'), nomorSK: 'SK/056/IV/2020' },
    }),
  ]);

  console.log('✅ Riwayat jabatan dibuat');

  // Create teaching history
  await Promise.all([
    prisma.teachingHistory.create({
      data: { employeeId: employees[0].id, semester: 'Ganjil', tahunAkademik: '2025/2026', mataKuliah: 'Keperawatan Medikal Bedah', sks: 3, kelas: 'A', programStudi: 'Keperawatan' },
    }),
    prisma.teachingHistory.create({
      data: { employeeId: employees[0].id, semester: 'Ganjil', tahunAkademik: '2025/2026', mataKuliah: 'Metodologi Penelitian Keperawatan', sks: 2, kelas: 'A', programStudi: 'Keperawatan' },
    }),
    prisma.teachingHistory.create({
      data: { employeeId: employees[1].id, semester: 'Ganjil', tahunAkademik: '2025/2026', mataKuliah: 'Keperawatan Dasar', sks: 4, kelas: 'B', programStudi: 'Keperawatan' },
    }),
    prisma.teachingHistory.create({
      data: { employeeId: employees[1].id, semester: 'Ganjil', tahunAkademik: '2025/2026', mataKuliah: 'Etika Keperawatan', sks: 2, kelas: 'A', programStudi: 'Keperawatan' },
    }),
  ]);

  console.log('✅ Riwayat mengajar dibuat');

  // Create documents
  const now = new Date();
  await Promise.all([
    // Ahmad Fauzi - Pendidikan
    prisma.document.create({
      data: {
        judul: 'SK Mengajar Semester Ganjil 2025/2026',
        nomorDokumen: 'SK/MENGAJAR/001/IX/2025',
        kategoriUtama: 'PENDIDIKAN',
        subKategori: 'SK_MENGAJAR',
        tanggalTerbit: new Date('2025-09-01'),
        masaBerlaku: new Date('2026-02-28'),
        semester: 'Ganjil',
        tahunAkademik: '2025/2026',
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/sk/SK-MENGAJAR-001-2025.pdf',
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    prisma.document.create({
      data: {
        judul: 'SK Pembimbing Skripsi Mahasiswa Angkatan 2022',
        nomorDokumen: 'SK/BIMBING/015/VIII/2025',
        kategoriUtama: 'PENDIDIKAN',
        subKategori: 'SK_PEMBIMBING',
        tanggalTerbit: new Date('2025-08-15'),
        masaBerlaku: new Date('2026-07-31'),
        semester: 'Ganjil',
        tahunAkademik: '2025/2026',
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-bimbing-015-2025.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    // Ahmad - Penelitian
    prisma.document.create({
      data: {
        judul: 'SK Tim Peneliti - Hibah Internal 2025',
        nomorDokumen: 'SK/PENELITIAN/008/III/2025',
        kategoriUtama: 'PENELITIAN',
        subKategori: 'SK_PENELITIAN',
        tanggalTerbit: new Date('2025-03-01'),
        masaBerlaku: new Date('2025-12-31'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-penelitian-008-2025.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    // Ahmad - Pengabdian
    prisma.document.create({
      data: {
        judul: 'Sertifikat Pemateri - Seminar Nasional Keperawatan',
        nomorDokumen: 'SERT/2025/NAT/456',
        kategoriUtama: 'PENGABDIAN',
        subKategori: 'SERTIFIKAT_PEMATERI',
        tanggalTerbit: new Date('2025-06-15'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sert-pemateri-semnas-2025.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    // Ahmad - Penunjang
    prisma.document.create({
      data: {
        judul: 'Surat Tugas Seminar di Jakarta',
        nomorDokumen: 'ST/2025/VI/089',
        kategoriUtama: 'PENUNJANG',
        subKategori: 'SURAT_TUGAS',
        tanggalTerbit: new Date('2025-06-10'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/st/ST-089-2025.pdf',
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    prisma.document.create({
      data: {
        judul: 'SK Kepanitiaan Dies Natalis STIKES Baktara',
        nomorDokumen: 'SK/PANITIA/002/V/2025',
        kategoriUtama: 'PENUNJANG',
        subKategori: 'SK_KEPANITIAAN',
        tanggalTerbit: new Date('2025-05-01'),
        masaBerlaku: new Date('2025-09-30'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-panitia-dies-2025.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
    // Ahmad - Kepegawaian
    prisma.document.create({
      data: {
        judul: 'SK Pengangkatan sebagai Dosen Tetap',
        nomorDokumen: 'SK/ANGKAT/001/I/2010',
        kategoriUtama: 'KEPEGAWAIAN',
        subKategori: 'SK_PENGANGKATAN',
        tanggalTerbit: new Date('2010-01-01'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-pengangkatan-ahmad-2010.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[0].id,
      },
    }),
    // Siti documents
    prisma.document.create({
      data: {
        judul: 'SK Mengajar Semester Ganjil 2025/2026',
        nomorDokumen: 'SK/MENGAJAR/002/IX/2025',
        kategoriUtama: 'PENDIDIKAN',
        subKategori: 'SK_MENGAJAR',
        tanggalTerbit: new Date('2025-09-01'),
        masaBerlaku: new Date('2026-02-28'),
        semester: 'Ganjil',
        tahunAkademik: '2025/2026',
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-mengajar-siti-2025.pdf',
        
        employeeId: employees[1].id,
        uploadedById: users[1].id,
      },
    }),
    prisma.document.create({
      data: {
        judul: 'Sertifikat Peserta Workshop Keperawatan Digital',
        nomorDokumen: 'SERT/WS/2025/123',
        kategoriUtama: 'PENUNJANG',
        subKategori: 'SERTIFIKAT_PESERTA',
        tanggalTerbit: new Date('2025-07-20'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/sert/SERT-WS-123-2025.pdf',
        employeeId: employees[1].id,
        uploadedById: users[1].id,
      },
    }),
    prisma.document.create({
      data: {
        judul: 'SK Pengangkatan sebagai Dosen Tetap',
        nomorDokumen: 'SK/ANGKAT/012/I/2015',
        kategoriUtama: 'KEPEGAWAIAN',
        subKategori: 'SK_PENGANGKATAN',
        tanggalTerbit: new Date('2015-01-01'),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-pengangkatan-siti-2015.pdf',
        
        employeeId: employees[1].id,
        uploadedById: users[0].id,
      },
    }),
    // Bambang documents
    prisma.document.create({
      data: {
        judul: 'SK Mengajar Semester Ganjil 2025/2026',
        nomorDokumen: 'SK/MENGAJAR/003/IX/2025',
        kategoriUtama: 'PENDIDIKAN',
        subKategori: 'SK_MENGAJAR',
        tanggalTerbit: new Date('2025-09-01'),
        masaBerlaku: new Date('2026-02-28'),
        semester: 'Ganjil',
        tahunAkademik: '2025/2026',
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sk-mengajar-bambang-2025.pdf',
        
        employeeId: employees[2].id,
        uploadedById: users[1].id,
      },
    }),
    // Document expiring soon
    prisma.document.create({
      data: {
        judul: 'Sertifikat Pelatihan BHD',
        nomorDokumen: 'SERT/BHD/2024/789',
        kategoriUtama: 'PENDIDIKAN',
        subKategori: 'SERTIFIKAT_PELATIHAN',
        tanggalTerbit: new Date('2024-08-15'),
        masaBerlaku: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
        status: 'AKTIF',
        tipeFile: 'LINK',
        linkRepository: 'https://repository.stikes-baktara.ac.id/arsip/sert-bhd-2024.pdf',
        
        employeeId: employees[0].id,
        uploadedById: users[1].id,
      },
    }),
  ]);

  console.log('✅ Dokumen dibuat');

  // Create attendance records for this month
  const today = new Date();
  for (let day = 1; day <= Math.min(today.getDate(), 28); day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const emp of employees.slice(0, 5)) {
      const isLate = Math.random() < 0.15;
      const jamMasuk = new Date(date);
      jamMasuk.setHours(isLate ? 8 + Math.floor(Math.random() * 2) : 7, Math.floor(Math.random() * 30), 0);
      
      const jamPulang = new Date(date);
      jamPulang.setHours(16 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);

      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          tanggal: date,
          jamMasuk: jamMasuk,
          jamPulang: day < today.getDate() ? jamPulang : undefined,
          statusMasuk: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
          statusPulang: day < today.getDate() ? 'TEPAT_WAKTU' : undefined,
          latitude: -7.8167 + (Math.random() * 0.001),
          longitude: 112.0167 + (Math.random() * 0.001),
        },
      });
    }
  }

  console.log('✅ Data presensi dibuat');

  console.log('\n🎉 Seeding selesai!');
  console.log('\n📋 Akun Login:');
  console.log('╭───────────────────────────────────╮');
  console.log('│ Admin    : admin    / 123         │');
  console.log('│ Pimpinan : pimpinan / 123         │');
  console.log('│ Dosen    : dosen    / 123         │');
  console.log('│ Tendik   : tendik   / 123         │');
  console.log('╰───────────────────────────────────╯');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
