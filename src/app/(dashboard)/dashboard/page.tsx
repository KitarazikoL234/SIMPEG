"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Network, Shield, Briefcase, Users, GraduationCap, User, FileText as FileIcon, AlertTriangle as FileWarningIcon } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/auth/me').then(res => res.json())
    ])
    .then(([statsData, authData]) => {
      setStats(statsData);
      if (authData.success && authData.user) {
        setUserRole(authData.user.role);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const doughnutData = {
    labels: ['Pendidikan', 'Penelitian', 'Pengabdian', 'Penunjang', 'Kepegawaian'],
    datasets: [
      {
        data: stats?.dokumenPerKategori || [12, 19, 3, 5, 2],
        backgroundColor: [
          '#3B82F6', // Blue
          '#8B5CF6', // Violet
          '#10B981', // Emerald
          '#F59E0B', // Amber
          '#EF4444', // Red
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.role === 'ADMIN' || stats?.role === 'PIMPINAN' ? (
          <>
            <StatCard 
              title="Total Dokumen" 
              value={loading ? "..." : stats?.totalDokumen || 0} 
              icon={<FileIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#3B82F6]"
              textColor="text-white"
              desc={`Pada ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}`}
              loading={loading}
            />
            <StatCard 
              title="Total Pegawai" 
              value={loading ? "..." : stats?.totalPegawai || 0} 
              icon={<UsersIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#4ADE80]"
              textColor="text-white"
              desc="Pegawai aktif"
              loading={loading}
            />
            <StatCard 
              title="Total Kategori" 
              value={loading ? "..." : 5} 
              icon={<FolderIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#F97316]"
              textColor="text-white"
              desc="Kategori digunakan"
              loading={loading}
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Dokumen Saya" 
              value={loading ? "..." : stats?.myTotalDokumen || 0} 
              icon={<FileIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#3B82F6]"
              textColor="text-white"
              desc="Total arsip diunggah"
              loading={loading}
            />
            <StatCard 
              title="Kategori Dokumen" 
              value={loading ? "..." : (stats?.dokumenPerKategori?.filter((c: number) => c > 0).length || 0)} 
              icon={<FolderIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#4ADE80]"
              textColor="text-white"
              desc="Kategori terisi"
              loading={loading}
            />
            <StatCard 
              title="Presensi Hari Ini" 
              value={loading ? "..." : (stats?.myPresensiHariIni ? "Hadir" : "Belum")} 
              icon={<UserCheckIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#F97316]"
              textColor="text-white"
              desc={loading ? "..." : (stats?.myPresensiHariIni ? "Presensi tercatat" : "Silakan absen masuk")}
              loading={loading}
            />
          </>
        )}
        <ActionCard 
          title="Tambah Arsip" 
          desc="Tambah arsip dokumen digital" 
          icon={<div className="text-white"><PlusIcon className="w-8 h-8" /></div>}
          buttonColor="bg-[#E11D48]"
          href="/dokumen/upload"
        />
      </div>

      {/* Charts & Recent Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Dokumen per Kategori</h2>
          <div className="h-[300px] flex items-center justify-center">
            {loading ? (
              <div className="w-48 h-48 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">Dokumen Terbaru</h2>
            <button className="text-sm font-medium text-[#2563EB] hover:text-blue-700">Lihat Semua</button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-10 h-10 rounded bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(stats?.dokumenTerbaru || dummyDocs).map((doc: any, i: number) => (
                  <div key={i} className="flex items-start space-x-3 group">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors cursor-pointer">
                        {doc.judul}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-[#64748B]">
                        <span className="truncate">{doc.pegawai}</span>
                        <span>•</span>
                        <span>{new Date(doc.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 uppercase">
                      {doc.kategori}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expiring Docs */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Dokumen Segera Kadaluarsa</h2>
            <p className="text-sm text-[#64748B] mt-1">Dokumen yang akan habis masa berlakunya dalam 30 hari ke depan</p>
          </div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
            {stats?.dokumenKadaluarsa?.length || 3}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Judul Dokumen</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Pegawai</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Tgl Kadaluarsa</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Sisa Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#64748B]">Memuat data...</td>
                </tr>
              ) : (stats?.dokumenKadaluarsa || dummyExpiringDocs).map((doc: any, i: number) => (
                <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileWarningIcon className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-[#0F172A]">{doc.judul}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{doc.pegawai}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {doc.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0F172A]">{new Date(doc.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {doc.sisaHari} Hari
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Struktur Organisasi (Only for Pimpinan) */}
      {userRole === 'PIMPINAN' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              Struktur Organisasi STIKES Baktara
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Ringkasan bagan struktur organisasi</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <div className="min-w-[700px] flex flex-col items-center py-4">
              {/* Level 1: Pimpinan */}
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm w-56 text-center relative z-10">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-blue-200" />
                  <h3 className="font-bold text-sm">Pimpinan / Ketua</h3>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
              </div>

              {/* Level 2 Container */}
              <div className="relative flex justify-center w-full">
                <div className="absolute top-0 w-2/3 h-px bg-slate-300"></div>
                
                <div className="flex justify-between w-full max-w-3xl px-8">
                  {/* Branch 1: Administrasi */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-8 bg-slate-300"></div>
                    <div className="bg-amber-500 text-white p-3 rounded-xl shadow-sm w-48 text-center relative z-10">
                      <Briefcase className="w-6 h-6 mx-auto mb-1 text-amber-200" />
                      <h3 className="font-bold text-sm">Administrasi</h3>
                    </div>
                    <div className="w-px h-8 bg-slate-300"></div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg shadow-sm w-40 text-center">
                      <Users className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                      <p className="font-semibold text-slate-700 text-xs">Staff Administrasi</p>
                    </div>
                  </div>

                  {/* Branch 2: Dosen / Tendik */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-8 bg-slate-300"></div>
                    <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm w-48 text-center relative z-10">
                      <GraduationCap className="w-6 h-6 mx-auto mb-1 text-emerald-200" />
                      <h3 className="font-bold text-sm">Akademik</h3>
                    </div>
                    <div className="flex gap-4 mt-6 relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-px bg-slate-300"></div>
                      
                      <div className="flex flex-col items-center">
                        <div className="absolute -top-6 w-px h-6 bg-slate-300"></div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg shadow-sm w-32 text-center">
                          <User className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          <p className="font-semibold text-slate-700 text-xs">Dosen</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center relative">
                        <div className="absolute -top-6 w-px h-6 bg-slate-300"></div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg shadow-sm w-32 text-center">
                          <User className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                          <p className="font-semibold text-slate-700 text-xs">Tendik</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgColor, textColor, desc, loading }: any) {
  return (
    <div className={`${bgColor} ${textColor} rounded-2xl shadow-sm relative overflow-hidden flex flex-col min-h-[130px]`}>
      <div className="px-6 pt-6 pb-4 relative z-10 flex-1 flex flex-col justify-center">
        <div className="flex flex-col relative z-20">
          <span className="text-4xl font-extrabold leading-none tracking-tight">{loading ? '...' : value}</span>
          <span className="text-[15px] font-medium mt-2 opacity-90">{title}</span>
        </div>
      </div>
      
      {/* Background Icon (Translucent) */}
      <div className="absolute right-6 top-6 opacity-30 pointer-events-none transform scale-[1.4] z-10">
        {icon}
      </div>

      <div className="bg-black/10 px-6 py-2.5 z-20 flex items-center gap-1.5 text-xs font-medium backdrop-blur-sm">
        <span className="opacity-90">ⓘ {desc}</span>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, buttonColor, href }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm flex min-h-[130px] overflow-hidden border border-slate-200">
      <div className="p-6 flex-1 flex flex-col justify-center">
        <span className="text-lg font-bold text-slate-800 leading-tight">{title}</span>
        <span className="text-xs text-slate-500 mt-2 leading-snug">{desc}</span>
      </div>
      <Link href={href} className={`w-24 ${buttonColor} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}>
        {icon}
      </Link>
    </div>
  );
}

// Dummy Data
const dummyDocs = [
  { judul: 'SK Mengajar Genap 2023/2024', pegawai: 'Dr. Ahmad Yani', tanggal: '23 Jul 2024', kategori: 'Pendidikan' },
  { judul: 'Laporan BKD Semester Ganjil', pegawai: 'Siti Aminah, M.Kep', tanggal: '20 Jul 2024', kategori: 'Kepegawaian' },
  { judul: 'Sertifikat Seminar Nasional', pegawai: 'Budi Santoso, S.Kep', tanggal: '18 Jul 2024', kategori: 'Penunjang' },
  { judul: 'Proposal Pengabdian Masyarakat', pegawai: 'Dr. Ahmad Yani', tanggal: '15 Jul 2024', kategori: 'Pengabdian' },
  { judul: 'Jurnal Keperawatan Terakreditasi', pegawai: 'Siti Aminah, M.Kep', tanggal: '10 Jul 2024', kategori: 'Penelitian' },
];

const dummyExpiringDocs = [
  { judul: 'STR Perawat', pegawai: 'Siti Aminah, M.Kep', kategori: 'Kepegawaian', tanggal: '15 Agustus 2024', sisaHari: 14 },
  { judul: 'Sertifikat Kompetensi', pegawai: 'Budi Santoso, S.Kep', kategori: 'Penunjang', tanggal: '20 Agustus 2024', sisaHari: 19 },
  { judul: 'Surat Tugas Belajar', pegawai: 'Dian Kusuma, S.KM', kategori: 'Pendidikan', tanggal: '01 September 2024', sisaHari: 31 },
];

// Icons
function UsersIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function GraduationCapIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
}
function BriefcaseIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}
function FolderIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
}
function FileIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function FileWarningIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v4"/><path d="M12 20h.01"/></svg>
}
function UserCheckIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
}

function PlusIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}
