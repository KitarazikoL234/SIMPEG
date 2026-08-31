'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getInitials, formatDate } from '@/lib/utils';
import { JenjangPendidikan, KategoriUtama, KATEGORI_COLORS, KATEGORI_ICONS } from '@/types';

type Tab = 'biodata' | 'pendidikan' | 'jabatan' | 'mengajar' | 'dokumen';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('biodata');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${id}`);
        const data = await res.json();
        if (data.success) {
          setEmployee(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Pegawai tidak ditemukan</h2>
        <Link href="/pegawai" className="mt-4 inline-block text-blue-600 hover:underline">Kembali ke Daftar Pegawai</Link>
      </div>
    );
  }

  const getFullName = () => {
    return `${employee.gelarDepan ? employee.gelarDepan + ' ' : ''}${employee.nama}${employee.gelarBelakang ? ', ' + employee.gelarBelakang : ''}`;
  };

  const renderBiodata = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Informasi Pribadi</h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Tempat, Tgl Lahir</span><span className="col-span-2 font-medium">{employee.tempatLahir || '-'}, {employee.tanggalLahir ? formatDate(employee.tanggalLahir) : '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Jenis Kelamin</span><span className="col-span-2 font-medium">{employee.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : employee.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Agama</span><span className="col-span-2 font-medium capitalize">{employee.agama?.toLowerCase() || '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Telepon</span><span className="col-span-2 font-medium">{employee.telepon || '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Email</span><span className="col-span-2 font-medium">{employee.email || '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Alamat</span><span className="col-span-2 font-medium">{employee.alamat || '-'}</span></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Informasi Kepegawaian</h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">NIP</span><span className="col-span-2 font-medium">{employee.nip || '-'}</span></div>
            {employee.tipeKepegawaian === 'DOSEN' && (
              <>
                <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">NIDN</span><span className="col-span-2 font-medium">{employee.nidn || '-'}</span></div>
                <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">NIDK</span><span className="col-span-2 font-medium">{employee.nidk || '-'}</span></div>
                <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Jabatan Akademik</span><span className="col-span-2 font-medium">{employee.jabatanAkademik || '-'}</span></div>
                <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Rumpun Ilmu</span><span className="col-span-2 font-medium">{employee.rumpunIlmu || '-'}</span></div>
                <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Serdos</span><span className="col-span-2 font-medium">{employee.sertifikasiPendidik ? `Ya (${employee.nomorSertifikasi})` : 'Tidak'}</span></div>
              </>
            )}
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Unit Kerja</span><span className="col-span-2 font-medium">{employee.unitKerja || '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Jabatan Struktural</span><span className="col-span-2 font-medium">{employee.jabatanStruktural || '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">Pangkat/Gol.</span><span className="col-span-2 font-medium">{employee.pangkat ? `${employee.pangkat} (${employee.golongan})` : '-'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-slate-500">TMT Pertama</span><span className="col-span-2 font-medium">{employee.tmtPertama ? formatDate(employee.tmtPertama) : '-'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendidikan = () => (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-800">Riwayat Pendidikan</h3>
        <button className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          + Tambah Riwayat
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Institusi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurusan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Lulus</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Ijazah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employee.educationHistory?.length > 0 ? employee.educationHistory.map((edu: any) => (
              <tr key={edu.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{edu.jenjang}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{edu.institusi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.jurusan || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.tahunLulus || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.nomorIjazah || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada data riwayat pendidikan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderJabatan = () => (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-800">Riwayat Jabatan</h3>
        <button className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          + Tambah Riwayat
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jabatan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pangkat/Gol.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">TMT</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor SK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employee.positionHistory?.length > 0 ? employee.positionHistory.map((pos: any) => (
              <tr key={pos.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{pos.jabatan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pos.pangkat ? `${pos.pangkat} (${pos.golongan})` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(pos.tmt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pos.nomorSK || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada data riwayat jabatan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMengajar = () => (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-800">Riwayat Mengajar</h3>
        <button className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          + Tambah Riwayat
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Akademik</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKS</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas / Prodi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employee.teachingHistory?.length > 0 ? employee.teachingHistory.map((th: any) => (
              <tr key={th.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{th.tahunAkademik}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{th.semester}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{th.mataKuliah}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{th.sks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{th.kelas || '-'} / {th.programStudi || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada data riwayat mengajar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDokumen = () => {
    // Group documents by kategoriUtama
    const grouped = employee.documents?.reduce((acc: any, doc: any) => {
      const cat = doc.kategoriUtama;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {}) || {};

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-slate-800">Dokumen Pegawai</h3>
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Upload Dokumen
          </button>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-slate-500">Belum ada dokumen yang diunggah.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, docs]: [string, any]) => (
            <div key={category} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2" 
                   style={{ backgroundColor: `${KATEGORI_COLORS[category as KategoriUtama]}10` }}>
                <span className="text-xl" style={{ color: KATEGORI_COLORS[category as KategoriUtama] }}>
                  {KATEGORI_ICONS[category as KategoriUtama] || '📄'}
                </span>
                <h4 className="font-semibold" style={{ color: KATEGORI_COLORS[category as KategoriUtama] }}>
                  {category}
                </h4>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 text-slate-600">
                  {docs.length} Dokumen
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{doc.judul}</span>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{doc.subKategori.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{formatDate(doc.tanggalTerbit)}</span>
                        {doc.nomorDokumen && (
                          <>
                            <span>•</span>
                            <span>No: {doc.nomorDokumen}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Lihat">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 z-0 rounded-t-2xl md:hidden"></div>
        
        <div className="z-10 w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
          {employee.foto ? (
            <img src={employee.foto} alt={employee.nama} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl md:text-4xl font-bold text-slate-400">{getInitials(employee.nama)}</span>
          )}
        </div>

        <div className="z-10 flex-1 text-center md:text-left mt-2 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{getFullName()}</h1>
            <div className="flex justify-center md:justify-start gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase
                ${employee.tipeKepegawaian === 'DOSEN' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {employee.tipeKepegawaian}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase
                ${employee.statusKepegawaian === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {employee.statusKepegawaian}
              </span>
            </div>
          </div>
          
          <div className="text-slate-500 font-medium mb-4">
            {employee.tipeKepegawaian === 'DOSEN' ? `NIDN: ${employee.nidn || '-'}` : `NIP: ${employee.nip || '-'}`}
          </div>
          
          <div className="grid grid-cols-2 md:flex md:gap-8 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Unit Kerja</p>
              <p className="font-medium text-slate-800">{employee.unitKerja || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Jabatan</p>
              <p className="font-medium text-slate-800">{employee.jabatanStruktural || employee.jabatanAkademik || '-'}</p>
            </div>
            {employee.golongan && (
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Golongan</p>
                <p className="font-medium text-slate-800">{employee.pangkat} ({employee.golongan})</p>
              </div>
            )}
          </div>
        </div>

        <div className="z-10 flex gap-3 w-full md:w-auto mt-4 md:mt-0 flex-wrap justify-end">
          <Link href={`/pegawai/${employee.id}/edit`} className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Profil
          </Link>
          {employee.tipeKepegawaian === 'DOSEN' && (
            <>
              <button 
                onClick={() => alert('Fitur Integrasi SISTER sedang dalam tahap persiapan. Harap konfigurasikan Kredensial API di menu Pengaturan terlebih dahulu.')}
                className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Tarik Data SISTER
              </button>
              <Link href={`/pegawai/${employee.id}/portofolio`} className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 transition-colors shadow-sm">
                <svg className="w-4 h-4 mr-2 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Portofolio BKD
              </Link>
              <Link href={`/pegawai/${employee.id}/bkd`} className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
                <svg className="w-4 h-4 mr-2 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Laporan BKD
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex -mb-px px-2" aria-label="Tabs">
            {[
              { id: 'biodata', label: 'Biodata' },
              { id: 'pendidikan', label: 'Riwayat Pendidikan' },
              { id: 'jabatan', label: 'Riwayat Jabatan' },
              ...(employee.tipeKepegawaian === 'DOSEN' ? [{ id: 'mengajar', label: 'Riwayat Mengajar' }] : []),
              { id: 'dokumen', label: 'Dokumen' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6 md:p-8">
          {activeTab === 'biodata' && renderBiodata()}
          {activeTab === 'pendidikan' && renderPendidikan()}
          {activeTab === 'jabatan' && renderJabatan()}
          {activeTab === 'mengajar' && renderMengajar()}
          {activeTab === 'dokumen' && renderDokumen()}
        </div>
      </div>
    </div>
  );
}
