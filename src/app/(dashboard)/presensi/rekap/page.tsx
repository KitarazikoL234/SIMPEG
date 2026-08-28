'use client';

import { useState, useEffect } from 'react';
import { Download, Filter, Users, Clock, AlertTriangle, XCircle, Search, FileSpreadsheet, Percent, Eye, X } from 'lucide-react';

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatTime = (dateStr: string | Date | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '-' : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
};

const formatDateStr = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

export default function RekapPresensiPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [filterBulan, setFilterBulan] = useState(currentMonth.toString());
  const [filterTahun, setFilterTahun] = useState(currentYear.toString());
  const [filterUnit, setFilterUnit] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userRole, setUserRole] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [summary, setSummary] = useState({
    totalPegawai: 0,
    totalHadir: 0,
    tepatWaktu: 0,
    terlambat: 0,
    tidakHadir: 0,
    rataPersentase: 0
  });

  const openDetail = async (emp: any) => {
    setSelectedEmployee(emp);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/attendance?employeeId=${emp.id}&month=${filterBulan}&year=${filterTahun}`);
      const json = await res.json();
      if (json.success) {
        setDetailData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUserRole(data.user.role || '');
          setEmployeeId(data.user.employeeId || '');
        }
      } catch (e) {
        console.error('Failed to fetch session', e);
      }
    };
    fetchSession();
  }, []);

  const fetchData = async () => {
    // Only fetch if session is loaded
    if (!userRole) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/recap?month=${filterBulan}&year=${filterTahun}&unitKerja=${encodeURIComponent(filterUnit)}`);
      const json = await res.json();
      
      if (json.success) {
        let filteredData = json.data;
        
        // ROLE-BASED FILTERING: EVERYONE only sees their own recap here.
        // (Global recap is moved to Laporan)
        if (employeeId) {
          filteredData = filteredData.filter((item: any) => item.id === employeeId);
        } else {
          // If they don't have an employeeId linked yet, they see nothing
          filteredData = [];
        }

        if (searchQuery) {
          filteredData = filteredData.filter((item: any) => 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.nip && item.nip.includes(searchQuery))
          );
        }
        
        setData(filteredData);
        
        // Calculate summary
        let totalHadir = 0, totalTepat = 0, totalTerlambat = 0, totalTidakHadir = 0;
        filteredData.forEach((item: any) => {
          totalHadir += item.hadir;
          totalTepat += item.tepatWaktu;
          totalTerlambat += item.terlambat;
          totalTidakHadir += item.tidakHadir;
        });
        
        const totalSemuaHari = totalHadir + totalTidakHadir;
        const rataPersentase = totalSemuaHari > 0 ? Math.round((totalHadir / totalSemuaHari) * 100) : 0;
        
        setSummary({
          totalPegawai: filteredData.length,
          totalHadir,
          tepatWaktu: totalTepat,
          terlambat: totalTerlambat,
          tidakHadir: totalTidakHadir,
          rataPersentase
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance recap', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterBulan, filterTahun, filterUnit, searchQuery, userRole, employeeId]);

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    
    const namaBulan = BULAN_OPTIONS[parseInt(filterBulan) - 1];
    const unitText = filterUnit ? filterUnit : 'Semua Unit Kerja';
    const now = new Date();
    const tglExport = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Build structured, neat CSV with Metadata Header, Headers, Data Rows, and Summary Footer
    const rows: string[] = [];

    // Header Metadata
    rows.push(['REKAPITULASI PRESENSI PEGAWAI'].map(escapeCSV).join(','));
    rows.push(['STIKES BAKTARA'].map(escapeCSV).join(','));
    rows.push(['Periode:', `${namaBulan} ${filterTahun}`].map(escapeCSV).join(','));
    rows.push(['Unit Kerja:', unitText].map(escapeCSV).join(','));
    rows.push(['Tanggal Unduh:', tglExport].map(escapeCSV).join(','));
    rows.push(['Total Pegawai:', `${data.length} Orang`].map(escapeCSV).join(','));
    rows.push(''); // Empty line before table

    // Table Headers
    const headers = [
      'No',
      'NIP / NIDN',
      'Nama Pegawai',
      'Unit Kerja',
      'Total Hadir',
      'Tepat Waktu',
      'Terlambat',
      'Tidak Hadir',
      'Persentase Kehadiran (%)'
    ];
    rows.push(headers.map(escapeCSV).join(','));

    // Data Rows
    data.forEach((row, index) => {
      const totalHariKerja = (row.hadir || 0) + (row.tidakHadir || 0);
      const persentase = totalHariKerja > 0 ? Math.round(((row.hadir || 0) / totalHariKerja) * 100) : 0;
      
      // Wrap NIP in ="..." so Excel preserves leading zeros and doesn't convert to scientific notation
      const formattedNIP = row.nip ? `="${row.nip}"` : '"-"';

      rows.push([
        escapeCSV(index + 1),
        formattedNIP,
        escapeCSV(row.nama),
        escapeCSV(row.unitKerja || '-'),
        escapeCSV(row.hadir),
        escapeCSV(row.tepatWaktu),
        escapeCSV(row.terlambat),
        escapeCSV(row.tidakHadir),
        escapeCSV(`${persentase}%`)
      ].join(','));
    });

    // Summary Total Row
    rows.push(''); // Empty separator line
    rows.push([
      '""',
      '"TOTAL"',
      escapeCSV(`${data.length} Pegawai`),
      '""',
      escapeCSV(summary.totalHadir),
      escapeCSV(summary.tepatWaktu),
      escapeCSV(summary.terlambat),
      escapeCSV(summary.tidakHadir),
      escapeCSV(`${summary.rataPersentase}%`)
    ].join(','));

    // Add UTF-8 BOM (\uFEFF) at the start so Excel and all spreadsheet apps open accents/characters properly
    const csvString = '\uFEFF' + rows.join('\r\n');
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const sanitizedUnit = filterUnit ? `_${filterUnit.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    link.setAttribute('download', `Rekap_Presensi_${namaBulan}_${filterTahun}${sanitizedUnit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            Rekap Presensi
          </h1>
          <p className="text-slate-500 mt-1 text-base">Laporan dan rekapitulasi data kehadiran pegawai STIKES Baktara</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={data.length === 0 || loading}
          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>Download CSV Rapi</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Bulan</label>
          <select 
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BULAN_OPTIONS.map((bln, idx) => (
              <option key={idx} value={idx + 1}>{bln}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun</label>
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(thn => (
              <option key={thn} value={thn}>{thn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pegawai</p>
            <p className="text-3xl font-bold text-slate-900">{summary.totalPegawai}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tepat Waktu (Total)</p>
            <p className="text-3xl font-bold text-green-600">{summary.tepatWaktu}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Terlambat (Total)</p>
            <p className="text-3xl font-bold text-amber-600">{summary.terlambat}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tidak Hadir (Total)</p>
            <p className="text-3xl font-bold text-red-600">{summary.tidakHadir}</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            Daftar Rekapitulasi Kehadiran: <span className="text-blue-600">{BULAN_OPTIONS[parseInt(filterBulan) - 1]} {filterTahun}</span>
          </h2>
          <span className="text-sm font-medium text-slate-500">Menampilkan {data.length} Pegawai</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">No</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Pegawai & NIP</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Kerja</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hadir</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Tepat Waktu</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Terlambat</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Tidak Hadir</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Persentase</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-base">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="mt-3 text-base text-slate-500 font-medium">Memuat data rekap...</p>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                <>
                  {data.map((row, idx) => {
                    const totalHari = (row.hadir || 0) + (row.tidakHadir || 0);
                    const pct = totalHari > 0 ? Math.round(((row.hadir || 0) / totalHari) * 100) : 0;

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-bold text-slate-900">{row.nama}</div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">{row.nip ? `NIP: ${row.nip}` : 'NIP: -'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {row.unitKerja || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600 text-center bg-blue-50/40">
                          {row.hadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-green-600 font-bold text-center bg-green-50/30">
                          {row.tepatWaktu}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-amber-600 font-bold text-center bg-amber-50/30">
                          {row.terlambat}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-red-600 font-bold text-center bg-red-50/30">
                          {row.tidakHadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDetail(row)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Detail Presensi"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Table Footer Totals */}
                  <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                    <td colSpan={3} className="px-6 py-4 text-slate-800 uppercase tracking-wider text-sm">
                      TOTAL KESELURUHAN ({data.length} Pegawai)
                    </td>
                    <td className="px-6 py-4 text-center text-blue-700 text-base">{summary.totalHadir}</td>
                    <td className="px-6 py-4 text-center text-green-700 text-base">{summary.tepatWaktu}</td>
                    <td className="px-6 py-4 text-center text-amber-700 text-base">{summary.terlambat}</td>
                    <td className="px-6 py-4 text-center text-red-700 text-base">{summary.tidakHadir}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white">
                        {summary.rataPersentase}%
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-500">
                    <p className="text-base">Tidak ada data presensi yang ditemukan untuk periode ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Detail Presensi: {selectedEmployee.nama}
                </h3>
                <p className="text-sm text-slate-500">
                  {BULAN_OPTIONS[parseInt(filterBulan) - 1]} {filterTahun}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal & Hari</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Pulang</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi Kerja</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {loadingDetail ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" /> 
                            <span className="font-semibold">Memuat riwayat presensi...</span>
                          </div>
                        </td>
                      </tr>
                    ) : detailData.length > 0 ? (
                      detailData.map((rec, idx) => {
                        let dur = '-';
                        if (rec.jamMasuk && rec.jamPulang) {
                          const diff = new Date(rec.jamPulang).getTime() - new Date(rec.jamMasuk).getTime();
                          const h = Math.floor(diff / 3600000);
                          const m = Math.floor((diff % 3600000) / 60000);
                          dur = `${h} jam ${m} mnt`;
                        }
                        
                        return (
                          <tr key={rec.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-900">{formatDateStr(rec.tanggal)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {rec.jamMasuk ? (
                                <span className={`inline-block font-mono font-bold text-sm px-2.5 py-0.5 rounded border ${
                                  rec.statusMasuk === 'TEPAT_WAKTU' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {formatTime(rec.jamMasuk)}
                                </span>
                              ) : <span className="text-slate-400 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {rec.jamPulang ? (
                                <span className={`inline-block font-mono font-bold text-sm px-2.5 py-0.5 rounded border ${
                                  rec.statusPulang === 'TEPAT_WAKTU' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {formatTime(rec.jamPulang)}
                                </span>
                              ) : <span className="text-slate-400 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="font-bold text-slate-600 text-sm">{dur}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                rec.statusMasuk === 'TEPAT_WAKTU' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {rec.statusMasuk === 'TEPAT_WAKTU' ? '✓ Tepat Waktu' : '⚠ Terlambat'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          <p className="text-base font-semibold">Tidak ada riwayat presensi yang tercatat.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
