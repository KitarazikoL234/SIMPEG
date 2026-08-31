'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, FileText, Grid as GridIcon, List as ListIcon,
  Filter, Download, Eye, MoreVertical, Link as LinkIcon, Trash2, Pencil
} from 'lucide-react';
import { KategoriUtama, KATEGORI_COLORS, KATEGORI_BG_COLORS, KATEGORI_UTAMA_LABELS, SUB_KATEGORI_LABELS, SubKategori } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DokumenPage() {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('SEMUA');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const catQuery = activeCategory !== 'SEMUA' ? `&kategoriUtama=${activeCategory}` : '';
      const res = await fetch(`/api/documents?q=${search}&limit=50${catQuery}`);
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search, activeCategory]);

  const deleteDocument = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus dokumen');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menghapus dokumen');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AKTIF': return 'bg-green-100 text-green-700 border-green-200';
      case 'KADALUARSA': return 'bg-red-100 text-red-700 border-red-200';
      case 'ARSIP': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (kategori: KategoriUtama) => {
    return {
      bg: KATEGORI_BG_COLORS[kategori] || '#f1f5f9',
      text: KATEGORI_COLORS[kategori] || '#64748b'
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Arsip Dokumen</h1>
          <p className="text-lg text-slate-500 mt-1">Kelola arsip dokumen kepegawaian</p>
        </div>
        <Link 
          href="/dokumen/upload" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-medium transition-colors shadow-sm"
        >
          <Plus className="w-6 h-6" />
          <span>Upload Dokumen</span>
        </Link>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 justify-between items-center">
        <div className="relative flex-1 max-w-xl w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-base text-slate-900"
            placeholder="Cari dokumen, pegawai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              <div className="relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none outline-none cursor-pointer"
                >
                  <option value="SEMUA">Semua Kategori</option>
                  {Object.keys(KATEGORI_UTAMA_LABELS).map((kat) => (
                    <option key={kat} value={kat}>
                      {KATEGORI_UTAMA_LABELS[kat as KategoriUtama]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-300 mx-1 shrink-0"></div>
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
              <button 
                onClick={() => setView('list')}
                className={`p-2.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setView('grid')}
                className={`p-2.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GridIcon className="w-6 h-6" />
              </button>
              </div>
            </div>
        </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-5">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">Tidak ada dokumen</h3>
          <p className="text-lg text-slate-500 mb-8">Belum ada dokumen yang diupload atau tidak sesuai kriteria pencarian.</p>
          <Link 
            href="/dokumen/upload" 
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-base font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Dokumen Pertama
          </Link>
        </div>
      ) : view === 'list' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Judul Dokumen</th>
                  <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Pegawai</th>
                  <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-8 py-5 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {documents.map((doc) => {
                  const colors = getCategoryColor(doc.kategoriUtama as KategoriUtama);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-xl mr-4 flex-shrink-0 ${doc.tipeFile === 'LINK' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {doc.tipeFile === 'LINK' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="text-base font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">{doc.judul}</div>
                            {doc.nomorDokumen && <div className="text-sm text-slate-500 truncate max-w-xs mt-1">{doc.nomorDokumen}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-base text-slate-900 font-medium">{doc.employee?.nama || '-'}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {KATEGORI_UTAMA_LABELS[doc.kategoriUtama as KategoriUtama]}
                        </span>
                        <div className="text-sm text-slate-500 mt-2">
                          {SUB_KATEGORI_LABELS[doc.subKategori as SubKategori] || doc.subKategori}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-slate-500">
                        {formatDate(doc.tanggalTerbit)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold w-fit border ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                          <div className="flex gap-1.5 mt-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Public</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">Tag: Penting</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-base font-medium">
                        <div className="flex justify-end gap-3">
                          {/* Preview Link */}
                          <a 
                            href={`/api/documents/${doc.id}/download`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-colors bg-white shadow-sm"
                            title="Lihat"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Lihat</span>
                          </a>

                          {/* Download/Link Button - only if file/link available */}
                          {(doc.tipeFile === 'LINK' && doc.linkRepository) ? (
                            <a 
                              href={doc.linkRepository}
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm bg-amber-500 hover:bg-amber-600"
                              title="Buka Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">Buka Link</span>
                            </a>
                          ) : (doc.tipeFile === 'UPLOAD' && doc.filePath) ? (
                            <a 
                              href={`/api/documents/${doc.id}/download`}
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm bg-blue-600 hover:bg-blue-700"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-sm font-medium">Download</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-400 bg-slate-100 rounded-lg text-xs font-medium">
                              <FileText className="w-3.5 h-3.5" />
                              Belum ada file
                            </span>
                          )}

                          {/* Edit Button */}
                          <Link 
                            href={`/dokumen/${doc.id}/edit`}
                            className="inline-flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            title="Edit Dokumen"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>

                          {/* Delete Button */}
                          <button 
                            onClick={() => deleteDocument(doc.id)}
                            className="inline-flex items-center justify-center p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {documents.map((doc) => {
            const colors = getCategoryColor(doc.kategoriUtama as KategoriUtama);
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-5">
                    <div className={`p-3 rounded-xl ${doc.tipeFile === 'LINK' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {doc.tipeFile === 'LINK' ? <LinkIcon className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <div className="flex gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Public</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Tag: V1</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2" title={doc.judul}>
                    {doc.judul}
                  </h3>
                  {doc.nomorDokumen && (
                    <p className="text-sm text-slate-500 mb-4 truncate">{doc.nomorDokumen}</p>
                  )}
                  
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Kategori</span>
                      <span 
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {KATEGORI_UTAMA_LABELS[doc.kategoriUtama as KategoriUtama]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Pegawai</span>
                      <span className="font-medium text-slate-700 truncate max-w-[120px]" title={doc.employee?.nama}>
                        {doc.employee?.nama || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tanggal</span>
                      <span className="text-slate-700 font-medium">{formatDate(doc.tanggalTerbit)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-2">
                  <a 
                    href={`/api/documents/${doc.id}/download`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors bg-white font-medium text-sm"
                    title="Lihat"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat
                  </a>
                  
                  {(doc.tipeFile === 'LINK' && doc.linkRepository) ? (
                    <a 
                      href={doc.linkRepository}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-white rounded-xl transition-colors font-medium text-sm bg-amber-500 hover:bg-amber-600"
                      title="Buka Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Buka
                    </a>
                  ) : (doc.tipeFile === 'UPLOAD' && doc.filePath) ? (
                    <a 
                      href={`/api/documents/${doc.id}/download`}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-white rounded-xl transition-colors font-medium text-sm bg-blue-600 hover:bg-blue-700"
                      title="Unduh"
                    >
                      <Download className="w-4 h-4" />
                      Unduh
                    </a>
                  ) : (
                    <span className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-slate-400 bg-slate-200 rounded-xl text-xs font-medium text-center">
                      <FileText className="w-3.5 h-3.5" />
                      Kosong
                    </span>
                  )}
                  <Link 
                    href={`/dokumen/${doc.id}/edit`}
                    className="inline-flex justify-center items-center p-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-colors bg-white shadow-sm"
                    title="Edit Dokumen"
                  >
                    <Pencil className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => deleteDocument(doc.id)}
                    className="inline-flex justify-center items-center p-2 border border-rose-200 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors bg-white shadow-sm"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
