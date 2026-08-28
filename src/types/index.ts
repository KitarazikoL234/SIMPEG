// ==================== ENUMS ====================

export enum Role {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  PEGAWAI = 'PEGAWAI',
}

export enum TipeKepegawaian {
  DOSEN = 'DOSEN',
  TENDIK = 'TENDIK',
}

export enum StatusKepegawaian {
  AKTIF = 'AKTIF',
  NONAKTIF = 'NONAKTIF',
  PENSIUN = 'PENSIUN',
  CUTI = 'CUTI',
}

export enum JenisKelamin {
  LAKI_LAKI = 'LAKI_LAKI',
  PEREMPUAN = 'PEREMPUAN',
}

export enum KategoriUtama {
  PENDIDIKAN = 'PENDIDIKAN',
  PENELITIAN = 'PENELITIAN',
  PENGABDIAN = 'PENGABDIAN',
  PENUNJANG = 'PENUNJANG',
  KEPEGAWAIAN = 'KEPEGAWAIAN',
}

export enum SubKategori {
  // Pendidikan
  SK_MENGAJAR = 'SK_MENGAJAR',
  SK_PEMBIMBING = 'SK_PEMBIMBING',
  SK_PENGUJI = 'SK_PENGUJI',
  SERTIFIKAT_PELATIHAN = 'SERTIFIKAT_PELATIHAN',
  // Penelitian
  SK_PENELITIAN = 'SK_PENELITIAN',
  PUBLIKASI = 'PUBLIKASI',
  HKI = 'HKI',
  // Pengabdian
  SK_PENGABDIAN = 'SK_PENGABDIAN',
  SERTIFIKAT_PEMATERI = 'SERTIFIKAT_PEMATERI',
  // Penunjang
  SK_KEPANITIAAN = 'SK_KEPANITIAAN',
  SK_TUGAS_TAMBAHAN = 'SK_TUGAS_TAMBAHAN',
  SURAT_TUGAS = 'SURAT_TUGAS',
  SERTIFIKAT_PESERTA = 'SERTIFIKAT_PESERTA',
  // Kepegawaian
  SK_PENGANGKATAN = 'SK_PENGANGKATAN',
  SK_JABATAN = 'SK_JABATAN',
  SK_PANGKAT = 'SK_PANGKAT',
  IJAZAH = 'IJAZAH',
  KONTRAK_KERJA = 'KONTRAK_KERJA',
  LAINNYA = 'LAINNYA',
}

export enum StatusDokumen {
  AKTIF = 'AKTIF',
  KADALUARSA = 'KADALUARSA',
  ARSIP = 'ARSIP',
}

export enum TipeFile {
  UPLOAD = 'UPLOAD',
  LINK = 'LINK',
}

export enum StatusPresensi {
  TEPAT_WAKTU = 'TEPAT_WAKTU',
  TERLAMBAT = 'TERLAMBAT',
  PULANG_AWAL = 'PULANG_AWAL',
}

export enum JenjangPendidikan {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
  D3 = 'D3',
  D4 = 'D4',
  S1 = 'S1',
  S2 = 'S2',
  S3 = 'S3',
}

// ==================== INTERFACES ====================

export interface SessionData {
  userId: string;
  email: string;
  nama: string;
  role: Role;
  employeeId?: string;
  isLoggedIn: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== LABEL MAPS ====================

export const KATEGORI_UTAMA_LABELS: Record<KategoriUtama, string> = {
  [KategoriUtama.PENDIDIKAN]: 'Pendidikan',
  [KategoriUtama.PENELITIAN]: 'Penelitian',
  [KategoriUtama.PENGABDIAN]: 'Pengabdian Masyarakat',
  [KategoriUtama.PENUNJANG]: 'Penunjang',
  [KategoriUtama.KEPEGAWAIAN]: 'Kepegawaian',
};

export const SUB_KATEGORI_LABELS: Record<SubKategori, string> = {
  [SubKategori.SK_MENGAJAR]: 'SK Mengajar',
  [SubKategori.SK_PEMBIMBING]: 'SK Pembimbing',
  [SubKategori.SK_PENGUJI]: 'SK Penguji',
  [SubKategori.SERTIFIKAT_PELATIHAN]: 'Sertifikat Pelatihan',
  [SubKategori.SK_PENELITIAN]: 'SK Penelitian',
  [SubKategori.PUBLIKASI]: 'Publikasi',
  [SubKategori.HKI]: 'HKI / Paten',
  [SubKategori.SK_PENGABDIAN]: 'SK Pengabdian',
  [SubKategori.SERTIFIKAT_PEMATERI]: 'Sertifikat Pemateri',
  [SubKategori.SK_KEPANITIAAN]: 'SK Kepanitiaan',
  [SubKategori.SK_TUGAS_TAMBAHAN]: 'SK Tugas Tambahan',
  [SubKategori.SURAT_TUGAS]: 'Surat Tugas',
  [SubKategori.SERTIFIKAT_PESERTA]: 'Sertifikat Peserta',
  [SubKategori.SK_PENGANGKATAN]: 'SK Pengangkatan',
  [SubKategori.SK_JABATAN]: 'SK Jabatan',
  [SubKategori.SK_PANGKAT]: 'SK Pangkat',
  [SubKategori.IJAZAH]: 'Ijazah',
  [SubKategori.KONTRAK_KERJA]: 'Kontrak Kerja',
  [SubKategori.LAINNYA]: 'Lainnya',
};

export const KATEGORI_SUB_MAP: Record<KategoriUtama, SubKategori[]> = {
  [KategoriUtama.PENDIDIKAN]: [
    SubKategori.SK_MENGAJAR,
    SubKategori.SK_PEMBIMBING,
    SubKategori.SK_PENGUJI,
    SubKategori.SERTIFIKAT_PELATIHAN,
  ],
  [KategoriUtama.PENELITIAN]: [
    SubKategori.SK_PENELITIAN,
    SubKategori.PUBLIKASI,
    SubKategori.HKI,
  ],
  [KategoriUtama.PENGABDIAN]: [
    SubKategori.SK_PENGABDIAN,
    SubKategori.SERTIFIKAT_PEMATERI,
  ],
  [KategoriUtama.PENUNJANG]: [
    SubKategori.SK_KEPANITIAAN,
    SubKategori.SK_TUGAS_TAMBAHAN,
    SubKategori.SURAT_TUGAS,
    SubKategori.SERTIFIKAT_PESERTA,
  ],
  [KategoriUtama.KEPEGAWAIAN]: [
    SubKategori.SK_PENGANGKATAN,
    SubKategori.SK_JABATAN,
    SubKategori.SK_PANGKAT,
    SubKategori.IJAZAH,
    SubKategori.KONTRAK_KERJA,
    SubKategori.LAINNYA,
  ],
};

export const KATEGORI_COLORS: Record<KategoriUtama, string> = {
  [KategoriUtama.PENDIDIKAN]: '#3B82F6',
  [KategoriUtama.PENELITIAN]: '#8B5CF6',
  [KategoriUtama.PENGABDIAN]: '#10B981',
  [KategoriUtama.PENUNJANG]: '#F59E0B',
  [KategoriUtama.KEPEGAWAIAN]: '#EF4444',
};

export const KATEGORI_BG_COLORS: Record<KategoriUtama, string> = {
  [KategoriUtama.PENDIDIKAN]: '#EFF6FF',
  [KategoriUtama.PENELITIAN]: '#F5F3FF',
  [KategoriUtama.PENGABDIAN]: '#ECFDF5',
  [KategoriUtama.PENUNJANG]: '#FFFBEB',
  [KategoriUtama.KEPEGAWAIAN]: '#FEF2F2',
};

export const KATEGORI_ICONS: Record<KategoriUtama, string> = {
  [KategoriUtama.PENDIDIKAN]: '📚',
  [KategoriUtama.PENELITIAN]: '🔬',
  [KategoriUtama.PENGABDIAN]: '🤝',
  [KategoriUtama.PENUNJANG]: '🔧',
  [KategoriUtama.KEPEGAWAIAN]: '📋',
};

export const STATUS_LABELS: Record<StatusKepegawaian, string> = {
  [StatusKepegawaian.AKTIF]: 'Aktif',
  [StatusKepegawaian.NONAKTIF]: 'Non-Aktif',
  [StatusKepegawaian.PENSIUN]: 'Pensiun',
  [StatusKepegawaian.CUTI]: 'Cuti',
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrator',
  [Role.OPERATOR]: 'Operator',
  [Role.PEGAWAI]: 'Pegawai',
};

export const JENJANG_LABELS: Record<JenjangPendidikan, string> = {
  [JenjangPendidikan.SD]: 'SD',
  [JenjangPendidikan.SMP]: 'SMP',
  [JenjangPendidikan.SMA]: 'SMA/SMK',
  [JenjangPendidikan.D3]: 'Diploma III (D3)',
  [JenjangPendidikan.D4]: 'Diploma IV (D4)',
  [JenjangPendidikan.S1]: 'Sarjana (S1)',
  [JenjangPendidikan.S2]: 'Magister (S2)',
  [JenjangPendidikan.S3]: 'Doktor (S3)',
};

export const JABATAN_AKADEMIK_OPTIONS = [
  'Tenaga Pengajar',
  'Asisten Ahli',
  'Lektor',
  'Lektor Kepala',
  'Guru Besar',
];

export const SEMESTER_OPTIONS = ['Ganjil', 'Genap'];

export function generateTahunAkademikOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const options: string[] = [];
  for (let i = currentYear + 1; i >= currentYear - 5; i--) {
    options.push(`${i}/${i + 1}`);
  }
  return options;
}
