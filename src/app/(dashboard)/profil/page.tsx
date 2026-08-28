'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, Camera, Save, Edit3, Phone, Mail, MapPin, Calendar, 
  BookOpen, Briefcase, Award, CheckCircle2, AlertCircle, 
  ArrowLeft, Upload, X, FileText, Clock
} from 'lucide-react';
import Link from 'next/link';

interface EmployeeProfile {
  id: string;
  nip: string | null;
  nidn: string | null;
  nidk: string | null;
  nama: string;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  agama: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  tipeKepegawaian: string;
  statusKepegawaian: string;
  unitKerja: string | null;
  jabatanAkademik: string | null;
  jabatanStruktural: string | null;
  pangkat: string | null;
  golongan: string | null;
  foto: string | null;
  documents: any[];
  educationHistory: any[];
  user: { email: string; role: string; nama: string } | null;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState<Partial<EmployeeProfile>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pribadi');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setForm(data.data);
        setPhotoPreview(data.data.foto || null);
      } else {
        setErrorMsg('Gagal memuat profil. Pastikan akun Anda terhubung ke data pegawai.');
      }
    } catch (e) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setForm(prev => ({ ...prev, foto: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setForm(data.data);
        setEditing(false);
        setSuccessMsg('✓ Profil berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (e) {
      setErrorMsg('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const getFullName = () => {
    if (!profile) return '';
    return `${profile.gelarDepan ? profile.gelarDepan + ' ' : ''}${profile.nama}${profile.gelarBelakang ? ', ' + profile.gelarBelakang : ''}`;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800 border-red-300',
      OPERATOR: 'bg-purple-100 text-purple-800 border-purple-300',
      PEGAWAI: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return map[role] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-semibold">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Profil Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">{errorMsg || 'Akun Anda belum terhubung ke data pegawai. Hubungi administrator.'}</p>
        <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'pribadi', label: 'Data Pribadi' },
    { id: 'kepegawaian', label: 'Kepegawaian' },
    { id: 'pendidikan', label: 'Pendidikan' },
    { id: 'dokumen', label: 'Dokumen' }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profil/${profile?.id}`);
    alert('Link profil disalin!');
  };

  return (
    <div className="bg-[#f0f2f5] min-h-[calc(100vh-64px)] p-4 sm:p-8">
      {/* Outer Container */}
      <div className="w-full bg-transparent flex flex-col">
        
        {/* Banner */}
        <div className="h-48 rounded-t-xl bg-gradient-to-r from-blue-500 to-blue-700 relative flex justify-end p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          {editing ? (
            <div className="relative z-10 flex gap-3 h-fit">
              <button
                onClick={() => { setEditing(false); setForm(profile!); setPhotoPreview(profile?.foto || null); setErrorMsg(''); }}
                className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded shadow-sm text-sm font-bold transition-colors border border-white/30 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded shadow-sm text-sm font-bold transition-colors h-fit border border-white/30 flex items-center gap-2 relative z-10"
            >
              <Edit3 className="w-4 h-4" /> Edit Profil
            </button>
          )}
        </div>

        {/* Content Overlapping Banner */}
        <div className="flex flex-col lg:flex-row px-4 sm:px-8 pb-12 gap-8 relative z-10">
          
          {/* Left Column (Profile Card) */}
          <div className="w-full lg:w-[300px] -mt-16 shrink-0">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow overflow-hidden bg-slate-200 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-3xl font-black">{getInitials(profile?.nama || '')}</span>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors border-2 border-white"
                    title="Ganti Foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              
              <h2 className="font-bold text-slate-800 text-lg text-center">{getFullName()}</h2>
              <p className="text-sm text-slate-500 mb-6 text-center">{profile?.unitKerja || profile?.tipeKepegawaian || 'Pegawai'}</p>

              <div className="w-full space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Dokumen</span>
                  <span className="text-amber-500 font-bold">{profile?.documents?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="text-emerald-500 font-bold">{profile?.statusKepegawaian || 'AKTIF'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">NIP/NIDN</span>
                  <span className="text-slate-700 font-bold">{profile?.nip || profile?.nidn || '-'}</span>
                </div>
              </div>

              <Link href="/dashboard" className="w-full py-2.5 border border-slate-300 rounded text-slate-600 text-sm font-bold mb-4 hover:bg-slate-50 text-center transition-colors">
                Kembali ke Dashboard
              </Link>
              
              <div className="w-full border border-slate-300 rounded flex text-xs overflow-hidden">
                <input value={`${typeof window !== 'undefined' ? window.location.origin : ''}/profil/${profile?.id}`} readOnly className="flex-1 px-3 py-2 outline-none text-blue-500 bg-slate-50 font-mono truncate" />
                <button onClick={handleCopyLink} className="px-3 border-l border-slate-300 hover:bg-slate-100 text-slate-600 bg-white" title="Salin Link">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Tabs & Form) */}
          <div className="flex-1 -mt-16">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
              
              {/* Tabs Header */}
              <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-blue-600' 
                        : 'text-slate-500 border-transparent hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="p-8 flex-1 flex flex-col">
                
                {/* Notifications Messages */}
                {successMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="font-bold text-emerald-800 text-sm">{successMsg}</p>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="font-bold text-red-800 text-sm">{errorMsg}</p>
                  </div>
                )}

                {/* Pribadi Tab */}
                {activeTab === 'pribadi' && (
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Gelar Depan</label>
                        {editing ? (
                          <input type="text" value={form.gelarDepan || ''} onChange={e => setForm({...form, gelarDepan: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.gelarDepan || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Lengkap</label>
                        {editing ? (
                          <input type="text" value={form.nama || ''} onChange={e => setForm({...form, nama: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.nama || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Gelar Belakang</label>
                        {editing ? (
                          <input type="text" value={form.gelarBelakang || ''} onChange={e => setForm({...form, gelarBelakang: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.gelarBelakang || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Email address</label>
                        {editing ? (
                          <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.email || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Phone Number</label>
                        {editing ? (
                          <input type="text" value={form.telepon || ''} onChange={e => setForm({...form, telepon: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.telepon || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Jenis Kelamin</label>
                        {editing ? (
                          <select value={form.jenisKelamin || ''} onChange={e => setForm({...form, jenisKelamin: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white">
                            <option value="">-- Pilih --</option>
                            <option value="LAKI_LAKI">LAKI LAKI</option>
                            <option value="PEREMPUAN">PEREMPUAN</option>
                          </select>
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.jenisKelamin?.replace('_', ' ') || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tempat Lahir</label>
                        {editing ? (
                          <input type="text" value={form.tempatLahir || ''} onChange={e => setForm({...form, tempatLahir: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.tempatLahir || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tanggal Lahir</label>
                        {editing ? (
                          <input type="date" value={form.tanggalLahir ? new Date(form.tanggalLahir).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, tanggalLahir: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{formatDate(profile?.tanggalLahir || null)}</div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Alamat</label>
                        {editing ? (
                          <textarea value={form.alamat || ''} onChange={e => setForm({...form, alamat: e.target.value})} rows={2} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.alamat || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kepegawaian Tab */}
                {activeTab === 'kepegawaian' && (
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">NIP</label>
                        {editing ? (
                          <input type="text" value={form.nip || ''} onChange={e => setForm({...form, nip: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.nip || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">NIDN</label>
                        {editing ? (
                          <input type="text" value={form.nidn || ''} onChange={e => setForm({...form, nidn: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.nidn || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipe Kepegawaian</label>
                        <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px] cursor-not-allowed">{profile?.tipeKepegawaian || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Unit Kerja</label>
                        {editing ? (
                          <input type="text" value={form.unitKerja || ''} onChange={e => setForm({...form, unitKerja: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.unitKerja || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Jabatan Akademik</label>
                        {editing ? (
                          <input type="text" value={form.jabatanAkademik || ''} onChange={e => setForm({...form, jabatanAkademik: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.jabatanAkademik || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Jabatan Struktural</label>
                        {editing ? (
                          <input type="text" value={form.jabatanStruktural || ''} onChange={e => setForm({...form, jabatanStruktural: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        ) : (
                          <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-sm text-slate-700 min-h-[38px]">{profile?.jabatanStruktural || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pendidikan Tab */}
                {activeTab === 'pendidikan' && (
                  <div className="flex-1 flex flex-col mb-8">
                    {profile?.educationHistory && profile.educationHistory.length > 0 ? (
                      <div className="space-y-4">
                        {profile.educationHistory.map((edu: any) => (
                          <div key={edu.id} className="border border-slate-200 p-4 rounded-lg flex items-start gap-4 bg-slate-50">
                            <BookOpen className="w-6 h-6 text-blue-500 mt-1" />
                            <div>
                              <h4 className="font-bold text-slate-800">{edu.institusi}</h4>
                              <p className="text-sm text-slate-600 mt-1">{edu.jenjang} - {edu.jurusan}</p>
                              <p className="text-xs text-slate-500 mt-1">Lulus: {edu.tahunLulus} {edu.ipk && `| IPK: ${edu.ipk}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Belum ada riwayat pendidikan.</p>
                    )}
                  </div>
                )}

                {/* Dokumen Tab */}
                {activeTab === 'dokumen' && (
                  <div className="flex-1 flex flex-col mb-8">
                    {profile?.documents && profile.documents.length > 0 ? (
                      <div className="space-y-3">
                        {profile.documents.map((doc: any) => (
                          <div key={doc.id} className="border border-slate-200 p-3 rounded-lg flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <span className="font-medium text-slate-800 text-sm">{doc.judul}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{doc.kategori}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Belum ada dokumen yang diunggah.</p>
                    )}
                  </div>
                )}

                {/* Bottom Action Area */}
                {editing && (
                  <div className="mt-auto border-t border-slate-100 pt-6">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded shadow text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      Update Profil
                    </button>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
