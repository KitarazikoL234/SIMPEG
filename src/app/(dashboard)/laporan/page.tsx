'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Users, 
  UserCheck, 
  Archive, 
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function LaporanPage() {
  const [stats, setStats] = useState<any>(null);
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/attendance/recap').then(res => res.json())
    ]).then(([statsData, recapData]) => {
      setStats(statsData);
      if (recapData.success) {
        setRekapData(recapData.data);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleDownloadPDF = () => {
    // Dynamic import to avoid SSR issues
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jsPDFModule, autoTableModule]) => {
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      
      // --- KOP SURAT ---
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.text('YAYASAN PENDIDIKAN BAKTI NUSANTARA', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(18);
      doc.text('SEKOLAH TINGGI ILMU KESEHATAN BAKTARA', pageWidth / 2, 28, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text('Jl. Kesehatan Raya No. 123, Kota Baktara, Provinsi Jawa Barat 40123', pageWidth / 2, 34, { align: 'center' });
      doc.text('Telp: (022) 1234567 | Email: info@stikes-baktara.ac.id | Web: stikes-baktara.ac.id', pageWidth / 2, 39, { align: 'center' });
      
      // Garis pemisah
      doc.setLineWidth(1);
      doc.line(15, 43, pageWidth - 15, 43);
      doc.setLineWidth(0.3);
      doc.line(15, 44.5, pageWidth - 15, 44.5);
      
      // --- JUDUL LAPORAN ---
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('LAPORAN EKSEKUTIF KEPEGAWAIAN', pageWidth / 2, 55, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 61, { align: 'center' });
      
      // --- RINGKASAN DATA ---
      const totalPegawai = stats?.totalPegawai || 0;
      const hadirHariIni = stats?.presensiHariIni || 0;
      const rataKehadiran = totalPegawai > 0 ? ((hadirHariIni / totalPegawai) * 100).toFixed(1) : '0';

      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('1. Ringkasan Statistik', 15, 75);
      
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(`- Total Seluruh Pegawai   : ${totalPegawai} Orang`, 20, 83);
      doc.text(`- Kehadiran Pegawai Hari Ini : ${rataKehadiran}% (${hadirHariIni} dari ${totalPegawai})`, 20, 90);
      doc.text(`- Total Dokumen Pegawai : ${stats?.totalDokumen || 0} Dokumen`, 20, 97);
      doc.text(`- Tiket Bantuan Aktif       : ${stats?.activeTickets || 0} Tiket`, 20, 104);
      
      // --- REKAP PRESENSI ---
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('2. Rekapitulasi Presensi Pegawai Bulan Ini', 15, 117);
      
      const bodyData = rekapData.map((pegawai: any, index: number) => [
        (index + 1).toString(),
        pegawai.nama,
        pegawai.hadir?.toString() || '0',
        pegawai.terlambat?.toString() || '0',
        pegawai.tidakHadir?.toString() || '0'
      ]);

      autoTable(doc, {
        startY: 122,
        head: [['No', 'Nama Pegawai', 'Hadir', 'Terlambat', 'Tidak Hadir']],
        body: bodyData.length > 0 ? bodyData : [['-', 'Tidak ada data', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], font: 'times', fontStyle: 'bold', halign: 'center' },
        bodyStyles: { font: 'times' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 30 },
        }
      });
      
      // --- TANDA TANGAN ---
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text('Kota Baktara, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - 50, finalY, { align: 'center' });
      doc.text('Pimpinan STIKES Baktara', pageWidth - 50, finalY + 6, { align: 'center' });
      
      doc.setFont('times', 'bold');
      doc.text('Dr. Hj. Nuraeni, M.Kes.', pageWidth - 50, finalY + 30, { align: 'center' });
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 85, finalY + 31, pageWidth - 15, finalY + 31);
      doc.setFont('times', 'normal');
      doc.text('NIDN: 0412117501', pageWidth - 50, finalY + 36, { align: 'center' });
      
      // Save PDF
      doc.save('Laporan_Eksekutif_Kepegawaian.pdf');
    });
  };

  const employeeData = {
    labels: ['Dosen', 'Tendik'],
    datasets: [{
      data: [stats?.totalDosen || 0, stats?.totalTendik || 0],
      backgroundColor: ['#3B82F6', '#10B981'],
      borderWidth: 0,
    }]
  };

  const archiveData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Dokumen Diunggah',
        data: [65, 59, 80, 81, 56, 95],
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Dokumen Kadaluarsa',
        data: [28, 48, 40, 19, 20, 27],
        backgroundColor: '#EF4444',
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex justify-end">
        <button 
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Download className="w-5 h-5" /> Unduh Laporan PDF
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">TOTAL SELURUH PEGAWAI</p>
              <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats?.totalPegawai || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-4 h-4" /> +2
            </span>
            <span className="text-slate-500 font-medium">Bulan ini</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">RATA-RATA KEHADIRAN</p>
              <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : `${stats?.totalPegawai > 0 ? ((stats?.presensiHariIni / stats?.totalPegawai) * 100).toFixed(1) : '0'}%`}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-4 h-4" /> {loading ? '...' : `${stats?.presensiHariIni || 0} / ${stats?.totalPegawai || 0}`}
            </span>
            <span className="text-slate-500 font-medium">Hadir hari ini</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">TOTAL DOKUMEN PEGAWAI</p>
              <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats?.totalDokumen || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <Archive className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Dikelola dalam sistem</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">TIKET BANTUAN AKTIF</p>
              <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats?.activeTickets || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
              Perlu Ditanggapi
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Aktivitas Pengarsipan Dokumen
          </h3>
          <div className="h-64 w-full">
            <Bar 
              data={archiveData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } },
                  x: { grid: { display: false } }
                },
                plugins: {
                  legend: { 
                    position: 'bottom', 
                    align: 'center', 
                    labels: { 
                      usePointStyle: true, 
                      padding: 20,
                      font: { size: 13, family: 'Inter, sans-serif', weight: 'bold' },
                      color: '#475569'
                    } 
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Komposisi Pegawai
          </h3>
          <div className="relative h-48 flex items-center justify-center mt-2">
            <Doughnut 
              data={employeeData} 
              options={{
                cutout: '75%',
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false } // Disable canvas legend to perfectly center chart
                }
              }} 
            />
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-800">{loading ? '...' : stats?.totalPegawai || 0}</span>
              <span className="text-xs font-bold text-slate-500 mt-1">Total</span>
            </div>
          </div>
          
          {/* Custom HTML Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {employeeData.labels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: employeeData.datasets[0].backgroundColor[i] }}></span>
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rekap Presensi Global */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Rekap Presensi Seluruh Pegawai
            </h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Lihat Detail &rarr;
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-xs font-bold text-slate-500 uppercase">Nama Pegawai</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 uppercase text-center">Hadir</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 uppercase text-center">Terlambat</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 uppercase text-center">Tidak Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapData.length > 0 ? rekapData.map((pegawai: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 text-sm font-bold text-slate-900">{pegawai.nama}</td>
                    <td className="py-3 text-sm font-bold text-emerald-600 text-center">{pegawai.hadir || 0}</td>
                    <td className="py-3 text-sm font-bold text-amber-600 text-center">{pegawai.terlambat || 0}</td>
                    <td className="py-3 text-sm font-bold text-rose-600 text-center">{pegawai.tidakHadir || 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500">
                      {loading ? 'Memuat data...' : 'Tidak ada data pegawai.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Latest Documents / Actions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Dokumen Masuk Masa Retensi (Kadaluarsa)
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Arsip</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Dokumen</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl Kadaluarsa</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {[
                { id: 'ARS-2021-042', title: 'SK Kepanitiaan Dies Natalis 2021', cat: 'Penunjang', date: '12 Agt 2026' },
                { id: 'ARS-2021-089', title: 'Laporan Pertanggungjawaban BEM', cat: 'Kemahasiswaan', date: '15 Agt 2026' },
                { id: 'ARS-2022-001', title: 'Sertifikat Akreditasi Lama', cat: 'Institusi', date: '01 Sep 2026' },
              ].map((doc, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-600">{doc.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{doc.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">{doc.cat}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-rose-600">{doc.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
                      Musnahkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
