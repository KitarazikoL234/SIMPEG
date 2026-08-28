# 🏥 SIMPEG — Sistem Informasi Manajemen Pegawai
### STIKES Baktara

Sistem digital untuk pengelolaan data pegawai, presensi, dokumen, laporan, dan helpdesk berbasis web.

---

## ⚙️ Teknologi

- **Framework:** Next.js 16 (App Router)
- **Bahasa:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS v4
- **Auth:** Iron Session

---

## 🚀 Cara Menjalankan (Setup Lokal)

### 1. Clone Proyek
```bash
git clone https://github.com/KitarazikoL234/SIMPEG.git
cd SIMPEG
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Buat File `.env`
Buat file `.env` di root proyek, isi dengan:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="ganti-dengan-string-rahasia-minimal-32-karakter"
GEMINI_API_KEY="isi-jika-ingin-chatbot-aktif"
```
> ⚠️ Minta file `.env` dari admin sistem secara langsung (tidak ada di GitHub).

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Sistem
```bash
npm run dev
```

Buka browser → [http://localhost:3000](http://localhost:3000)

---

## 👤 Akun Default (Setelah Seeding)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Pimpinan | pimpinan | pimpinan123 |
| Dosen | dosen | dosen123 |

---

## 🔄 Alur Kolaborasi Tim

```bash
# Sebelum mulai kerja — ambil update terbaru
git pull origin main

# Setelah membuat perubahan — kirim ke GitHub
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

---

## 📁 Struktur Folder Utama

```
src/
├── app/
│   ├── (dashboard)/     # Semua halaman dashboard
│   │   ├── bantuan/     # Helpdesk & tiket
│   │   ├── dashboard/   # Halaman utama
│   │   ├── dokumen/     # Manajemen dokumen
│   │   ├── laporan/     # Laporan & analitik
│   │   ├── pegawai/     # Data pegawai
│   │   ├── presensi/    # Absensi pegawai
│   │   └── layout.tsx   # Sidebar & Header
│   └── api/             # Backend API endpoints
├── components/          # Komponen reusable (Chatbot, dll)
├── lib/                 # Utilitas (auth, prisma, dll)
prisma/
├── schema.prisma        # Skema database
└── seed.ts              # Data awal
```
