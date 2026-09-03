'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, File, X, Link as LinkIcon, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { 
  KategoriUtama, 
  KATEGORI_UTAMA_LABELS, 
  KATEGORI_SUB_MAP, 
  SUB_KATEGORI_LABELS,
  SEMESTER_OPTIONS,
  generateTahunAkademikOptions
} from '@/types';

export default function UploadDokumenPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [taggedFiles, setTaggedFiles] = useState<Record<string, File | null>>({});
  const [taggedTipeFile, setTaggedTipeFile] = useState<Record<string, 'UPLOAD' | 'LINK'>>({});
  const [taggedLinks, setTaggedLinks] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    taggedEmployees: [] as string[],
    judul: '',
    nomorDokumen: '',
    kategoriUtama: '' as KategoriUtama | '',
    subKategori: '',
    tanggalTerbit: '',
    hasMasaBerlaku: false,
    masaBerlaku: '',
    semester: '',
    tahunAkademik: '',
    catatan: '',
    tipeFile: 'UPLOAD',
    linkRepository: '',
  });

  const tahunOptions = generateTahunAkademikOptions();

  useEffect(() => {
    // Fetch user role for default employee assignment
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const u = data.user;
          setUserData(u);
          
          if (u.role !== 'ADMIN' && u.role !== 'PIMPINAN' && u.employeeId) {
            setFormData(prev => ({ ...prev, employeeId: u.employeeId! }));
          }
        }
      })
      .catch(console.error);

    // Fetch employees for dropdown (even non-admins need this for tagging)
    fetch('/api/employees?limit=200')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.data) {
          setEmployees(data.data.data);
        }
      })
      .catch(console.error);

    // Fetch custom categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomCategories(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        ...(name === 'kategoriUtama' ? { subKategori: '' } : {}) 
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Hanya file PDF yang diperbolehkan');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Hanya file PDF yang diperbolehkan');
      }
    }
  };

  const handleTaggedFileSelect = (empId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setTaggedFiles(prev => ({ ...prev, [empId]: selectedFile }));
      } else {
        alert('Hanya file PDF yang diperbolehkan');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainFilePath = '';
      let mainUkuranFile = 0;

      // Handle main file upload
      if (formData.tipeFile === 'UPLOAD' && file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error(uploadJson.error || 'Upload failed');
        mainFilePath = uploadJson.data.filePath;
        mainUkuranFile = uploadJson.data.ukuranFile;
      }

      // Handle tagged files upload
      const processedTaggedEmployees = await Promise.all(
        formData.taggedEmployees.map(async (empId) => {
          const tipe = taggedTipeFile[empId] || formData.tipeFile;
          let customFilePath = mainFilePath;
          let customUkuranFile = mainUkuranFile;
          let customLink = formData.linkRepository;

          if (tipe === 'UPLOAD' && taggedFiles[empId]) {
            const uploadData = new FormData();
            uploadData.append('file', taggedFiles[empId] as File);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
            const uploadJson = await uploadRes.json();
            if (!uploadJson.success) throw new Error(uploadJson.error || `Upload failed for ${empId}`);
            customFilePath = uploadJson.data.filePath;
            customUkuranFile = uploadJson.data.ukuranFile;
            customLink = '';
          } else if (tipe === 'LINK' && taggedLinks[empId]) {
            customLink = taggedLinks[empId];
            customFilePath = '';
            customUkuranFile = 0;
          } else if (tipe === 'UPLOAD' && !taggedFiles[empId] && formData.tipeFile === 'LINK') {
              // Edge case: tagged wants UPLOAD but didn't provide file, and main is LINK.
              // Just fallback to main LINK.
              return { id: empId };
          }

          return {
            id: empId,
            tipeFile: tipe,
            filePath: customFilePath,
            ukuranFile: customUkuranFile,
            linkRepository: customLink
          };
        })
      );

      // Submit document data
      const docData = {
        ...formData,
        masaBerlaku: formData.hasMasaBerlaku ? formData.masaBerlaku : null,
        filePath: mainFilePath,
        ukuranFile: mainUkuranFile,
        taggedEmployees: processedTaggedEmployees
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });

      const json = await res.json();
      
      if (json.success) {
        setSuccessModal(true);
      } else {
        throw new Error(json.error || 'Failed to save document');
      }
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dokumen" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Dokumen Baru</h1>
          <p className="text-slate-500 mt-1">Tambahkan dokumen kepegawaian ke dalam arsip digital</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
            Informasi Dokumen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Pegawai *</label>
              <select
                name="employeeId"
                required
                value={formData.employeeId}
                onChange={handleChange}
                disabled={userData && userData.role !== 'ADMIN' && userData.role !== 'PIMPINAN'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Pegawai --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nama} ({emp.nip || emp.nidn})</option>
                ))}
              </select>
            </div>

            {formData.employeeId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bagikan ke Pegawai Lain (Tag)</label>
                <p className="text-xs text-slate-500 mb-2">Pilih pegawai lain yang juga terkait dengan dokumen ini (dokumen akan disalin ke arsip mereka).</p>
                <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 bg-slate-50 space-y-1">
                  {employees.filter(emp => emp.id !== formData.employeeId).map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.taggedEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, taggedEmployees: [...prev.taggedEmployees, emp.id] }));
                          } else {
                            setFormData(prev => ({ ...prev, taggedEmployees: prev.taggedEmployees.filter(id => id !== emp.id) }));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
                      />
                      <span className="text-sm text-slate-700 font-medium">{emp.nama} <span className="text-slate-400 font-normal">({emp.nip || emp.nidn || '-'})</span></span>
                    </label>
                  ))}
                  {employees.length <= 1 && (
                    <p className="text-sm text-slate-400 p-2 italic">Tidak ada pegawai lain untuk ditag.</p>
                  )}
                </div>
              </div>
            )}


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Dokumen *</label>
              <input
                type="text"
                name="judul"
                required
                value={formData.judul}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Contoh: SK Pengangkatan Dosen Tetap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Utama *</label>
              <select
                name="kategoriUtama"
                required
                value={formData.kategoriUtama}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Pilih Kategori --</option>
                {Object.values(KategoriUtama).map(cat => (
                  <option key={cat} value={cat}>{KATEGORI_UTAMA_LABELS[cat as KategoriUtama]}</option>
                ))}
                {customCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sub Kategori *</label>
              {Object.values(KategoriUtama).includes(formData.kategoriUtama as any) ? (
                <select
                  name="subKategori"
                  required
                  value={formData.subKategori}
                  onChange={handleChange}
                  disabled={!formData.kategoriUtama}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">-- Pilih Sub Kategori --</option>
                  {formData.kategoriUtama && KATEGORI_SUB_MAP[formData.kategoriUtama as KategoriUtama]?.map(sub => (
                    <option key={sub} value={sub}>{SUB_KATEGORI_LABELS[sub] || sub}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="subKategori"
                  required
                  value={formData.subKategori}
                  onChange={handleChange}
                  disabled={!formData.kategoriUtama}
                  placeholder={formData.kategoriUtama ? "Ketik sub kategori manual..." : "Pilih kategori utama dulu"}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Dokumen</label>
              <input
                type="text"
                name="nomorDokumen"
                value={formData.nomorDokumen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Contoh: 123/SK/2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Terbit *</label>
              <input
                type="date"
                name="tanggalTerbit"
                required
                value={formData.tanggalTerbit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasMasaBerlaku"
                  checked={formData.hasMasaBerlaku}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Dokumen memiliki masa berlaku
              </label>
              
              {formData.hasMasaBerlaku && (
                <div className="pl-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Berlaku Sampai *</label>
                  <input
                    type="date"
                    name="masaBerlaku"
                    required={formData.hasMasaBerlaku}
                    value={formData.masaBerlaku}
                    onChange={handleChange}
                    className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester (Opsional)</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Pilih Semester --</option>
                {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Akademik (Opsional)</label>
              <select
                name="tahunAkademik"
                value={formData.tahunAkademik}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Pilih Tahun Akademik --</option>
                {tahunOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                name="catatan"
                rows={3}
                value={formData.catatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
            File Dokumen
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.tipeFile === 'UPLOAD' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white text-slate-600'}`}>
              <input type="radio" name="tipeFile" value="UPLOAD" checked={formData.tipeFile === 'UPLOAD'} onChange={handleChange} className="sr-only" />
              <UploadCloud className="w-6 h-6 mb-2" />
              <span className="font-medium">Upload File PDF</span>
            </label>
            <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.tipeFile === 'LINK' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white text-slate-600'}`}>
              <input type="radio" name="tipeFile" value="LINK" checked={formData.tipeFile === 'LINK'} onChange={handleChange} className="sr-only" />
              <LinkIcon className="w-6 h-6 mb-2" />
              <span className="font-medium">Tautan Repository</span>
            </label>
          </div>

          {formData.tipeFile === 'UPLOAD' ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="application/pdf" 
                className="hidden" 
              />
              
              {file ? (
                <div className="flex flex-col items-center w-full max-w-md">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <File className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-slate-900 text-center truncate w-full px-4">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 px-4 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" /> Hapus File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-slate-700">Seret file PDF ke sini atau klik untuk memilih</p>
                  <p className="text-sm text-slate-500 mt-2">Maksimal ukuran file: 10MB</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tautan Repository / Google Drive *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  name="linkRepository"
                  required={formData.tipeFile === 'LINK'}
                  value={formData.linkRepository}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="https://repository.example.com/dokumen/SK123.pdf"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Pastikan tautan dapat diakses secara publik (tidak memerlukan login).</p>
            </div>
          )}
          
          {formData.taggedEmployees.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-md font-bold text-slate-900 mb-4">File Khusus untuk Pegawai yang Ditag</h3>
              <p className="text-sm text-slate-500 mb-6">
                Anda dapat mengunggah file yang berbeda untuk setiap pegawai yang ditag. Jika dikosongkan, mereka akan menerima salinan dari File Utama di atas.
              </p>
              
              <div className="space-y-6">
                {formData.taggedEmployees.map(empId => {
                  const emp = employees.find(e => e.id === empId);
                  if (!emp) return null;
                  
                  const tipe = taggedTipeFile[empId] || formData.tipeFile;
                  const tFile = taggedFiles[empId];
                  const tLink = taggedLinks[empId] || '';

                  return (
                    <div key={empId} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-800">{emp.nama}</h4>
                        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                          <button
                            type="button"
                            onClick={() => setTaggedTipeFile(prev => ({ ...prev, [empId]: 'UPLOAD' }))}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${tipe === 'UPLOAD' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaggedTipeFile(prev => ({ ...prev, [empId]: 'LINK' }))}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${tipe === 'LINK' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            Link
                          </button>
                        </div>
                      </div>

                      {tipe === 'UPLOAD' ? (
                        <div className="flex items-center gap-4">
                          <label className="flex-shrink-0 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                            <span>Pilih File PDF</span>
                            <input 
                              type="file" 
                              accept="application/pdf"
                              onChange={(e) => handleTaggedFileSelect(empId, e)}
                              className="hidden"
                            />
                          </label>
                          <div className="flex-1 min-w-0">
                            {tFile ? (
                              <div className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200">
                                <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{tFile.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setTaggedFiles(prev => ({ ...prev, [empId]: null }))}
                                  className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400 italic">Menggunakan File Utama...</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <input
                          type="url"
                          placeholder="https://..."
                          value={tLink}
                          onChange={(e) => setTaggedLinks(prev => ({ ...prev, [empId]: e.target.value }))}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Link href="/dokumen" className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Batal
          </Link>
          <button 
            type="submit" 
            disabled={loading || (formData.tipeFile === 'UPLOAD' && !file)}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span>Simpan Dokumen</span>
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-popup">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Berhasil!</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Dokumen berhasil disimpan ke dalam arsip digital.
              </p>
              <button 
                onClick={() => router.push('/dokumen')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-sm active:scale-95"
              >
                Kembali ke Arsip Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
