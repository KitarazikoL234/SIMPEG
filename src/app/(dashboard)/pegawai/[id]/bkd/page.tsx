'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { KategoriUtama, SEMESTER_OPTIONS, generateTahunAkademikOptions, KATEGORI_COLORS, KATEGORI_BG_COLORS, KATEGORI_ICONS, KATEGORI_UTAMA_LABELS } from '@/types';

export default function PersiapanBKDPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [employee, setEmployee] = useState<any>(null);
  const [documents, setDocuments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [semester, setSemester] = useState('');
  const [tahunAkademik, setTahunAkademik] = useState('');
  const tahunOptions = generateTahunAkademikOptions();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employee info
        const empRes = await fetch(`/api/employees/${id}`);
        const empData = await empRes.json();
        if (empData.success) {
          setEmployee(empData.data);
        }

        // Fetch BKD documents
        const query = new URLSearchParams();
        if (semester) query.append('semester', semester);
        if (tahunAkademik) query.append('tahunAkademik', tahunAkademik);

        const bkdRes = await fetch(`/api/employees/${id}/bkd?${query}`);
        const bkdData = await bkdRes.json();
        if (bkdData.success) {
          setDocuments(bkdData.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, semester, tahunAkademik]);

  if (loading && !employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getFullName = () => {
    if (!employee) return '';
    return `${employee.gelarDepan ? employee.gelarDepan + ' ' : ''}${employee.nama}${employee.gelarBelakang ? ', ' + employee.gelarBelakang : ''}`;
  };

  const tridharmaCategories = [
    KategoriUtama.PENDIDIKAN,
    KategoriUtama.PENELITIAN,
    KategoriUtama.PENGABDIAN,
    KategoriUtama.PENUNJANG
  ];

  // Calculate summary
  const summary = tridharmaCategories.map(cat => ({
    category: cat,
    count: documents[cat]?.length || 0,
    color: KATEGORI_COLORS[cat as KategoriUtama],
    bg: KATEGORI_BG_COLORS[cat as KategoriUtama],
    icon: KATEGORI_ICONS[cat as KategoriUtama] || '📄'
  }));

  const totalDocs = summary.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/pegawai/${id}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Persiapan BKD</h1>
          <p className="text-slate-500 text-sm mt-1">{getFullName()}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Semester:</span>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
            >
              <option value="">Semua Semester</option>
              {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Tahun Akademik:</span>
            <select 
              value={tahunAkademik} 
              onChange={(e) => setTahunAkademik(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
            >
              <option value="">Semua Tahun</option>
              {tahunOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        
        <button disabled={totalDocs === 0} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download ZIP ({totalDocs})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((item) => (
          <div key={item.category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110" style={{ backgroundColor: item.color }}></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <span className="text-3xl font-bold text-slate-800">{item.count}</span>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mt-auto text-slate-600">
              {KATEGORI_UTAMA_LABELS[item.category as KategoriUtama]}
            </h3>
          </div>
        ))}
      </div>

      {/* Document Tree */}
      <div className="space-y-6 mt-8">
        {tridharmaCategories.map((category) => {
          const docs = documents[category] || [];
          const label = KATEGORI_UTAMA_LABELS[category as KategoriUtama];
          const color = KATEGORI_COLORS[category as KategoriUtama];
          const bg = KATEGORI_BG_COLORS[category as KategoriUtama];
          
          return (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100" style={{ backgroundColor: bg }}>
                <span className="text-2xl" style={{ color }}>{KATEGORI_ICONS[category as KategoriUtama] || '📄'}</span>
                <div>
                  <h2 className="text-lg font-bold" style={{ color }}>{label}</h2>
                  <p className="text-xs font-medium text-slate-600 opacity-80">{docs.length} Dokumen Ditemukan</p>
                </div>
              </div>
              
              <div className="p-0">
                {docs.length === 0 ? (
                  <div className="px-6 py-8 text-center bg-slate-50/50">
                    <p className="text-slate-500 text-sm">Belum ada dokumen untuk kategori ini pada periode yang dipilih.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {docs.map((doc: any) => (
                      <div key={doc.id} className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{doc.judul}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                              {doc.subKategori.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span>Tgl: {formatDate(doc.tanggalTerbit)}</span>
                            {doc.nomorDokumen && (
                              <>
                                <span>•</span>
                                <span>No: {doc.nomorDokumen}</span>
                              </>
                            )}
                            {doc.semester && doc.tahunAkademik && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">{doc.semester} {doc.tahunAkademik}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Lihat
                          </button>
                          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Unduh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
