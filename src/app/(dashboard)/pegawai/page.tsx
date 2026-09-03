'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { KategoriUtama, StatusKepegawaian, TipeKepegawaian } from '@/types';

interface Employee {
  id: string;
  nama: string;
  nip: string | null;
  nidn: string | null;
  tipeKepegawaian: string;
  statusKepegawaian: string;
  unitKerja: string | null;
  jabatanAkademik: string | null;
  jabatanStruktural: string | null;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  foto: string | null;
}

function EmployeeListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipeParam = searchParams.get('tipe');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipe, setTipe] = useState(tipeParam || '');
  const [status, setStatus] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (tipeParam !== null) {
      setTipe(tipeParam);
    }
  }, [tipeParam]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(tipe && { tipeKepegawaian: tipe }),
        ...(status && { statusKepegawaian: status }),
        ...(unitKerja && { unitKerja }),
      });
      const res = await fetch(`/api/employees?${query}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.data);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search, tipe, status, unitKerja]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${name}?`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (res.ok) fetchEmployees();
      } catch (error) {
        alert('Gagal menghapus data pegawai');
      }
    }
  };

  const getFullName = (emp: Employee) => {
    return `${emp.gelarDepan ? emp.gelarDepan + ' ' : ''}${emp.nama}${emp.gelarBelakang ? ', ' + emp.gelarBelakang : ''}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pegawai</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data dosen dan tenaga kependidikan</p>
        </div>
        {(userRole === 'ADMIN' || userRole === 'OPERATOR') && (
          <Link 
            href="/pegawai/tambah"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pegawai
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, NIP, atau NIDN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <select 
            value={tipe} 
            onChange={(e) => setTipe(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Tipe</option>
            <option value="DOSEN">Dosen</option>
            <option value="TENDIK">Tendik</option>
          </select>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Non-Aktif</option>
            <option value="CUTI">Cuti</option>
            <option value="PENSIUN">Pensiun</option>
          </select>
          <select 
            value={unitKerja} 
            onChange={(e) => setUnitKerja(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Unit Kerja</option>
            <option value="S1 Keperawatan">S1 Keperawatan</option>
            <option value="D3 Kebidanan">D3 Kebidanan</option>
            <option value="BAAK">BAAK</option>
            <option value="LPPM">LPPM</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pegawai</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit / Jabatan</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Belum ada data pegawai</h3>
                    <p className="mt-1 text-sm text-slate-500">Mulai dengan menambahkan pegawai baru.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/pegawai/${emp.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {emp.foto ? (
                            <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={emp.foto} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 flex items-center justify-center text-blue-700 font-semibold text-sm">
                              {getInitials(emp.nama)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{getFullName(emp)}</div>
                          <div className="text-sm text-slate-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emp.tipeKepegawaian === 'DOSEN' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {emp.tipeKepegawaian}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">NIP: {emp.nip || '-'}</div>
                      <div className="text-sm text-slate-500">NIDN: {emp.nidn || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{emp.unitKerja || '-'}</div>
                      <div className="text-sm text-slate-500">{emp.jabatanStruktural || emp.jabatanAkademik || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${emp.statusKepegawaian === 'AKTIF' ? 'bg-green-100 text-green-800' : 
                          emp.statusKepegawaian === 'NONAKTIF' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {emp.statusKepegawaian.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/pegawai/${emp.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        {(userRole === 'ADMIN' || userRole === 'OPERATOR') && (
                          <Link href={`/pegawai/${emp.id}/edit`} className="text-amber-600 hover:bg-amber-100 bg-amber-50 p-2 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </Link>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'PIMPINAN') && (
                          <button onClick={() => handleDelete(emp.id, emp.nama)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Keluarkan / Hapus">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Halaman <span className="font-medium text-slate-900">{page}</span> dari <span className="font-medium text-slate-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat halaman...</div>}>
      <EmployeeListContent />
    </Suspense>
  );
}
