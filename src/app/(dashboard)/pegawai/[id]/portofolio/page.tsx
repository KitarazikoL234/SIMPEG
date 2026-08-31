'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  HandHeart,
  Award,
  GraduationCap,
  Plus,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

// Helper: format tanggal
function formatDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Label helpers
const jenisPenelitianLabel: Record<string, string> = {
  JURNAL: 'Jurnal Ilmiah', PROSIDING: 'Prosiding', BUKU: 'Buku/Book Chapter', HKI: 'HKI/Paten', PATEN: 'Paten'
};
const jenisPengabdianLabel: Record<string, string> = {
  PENYULUHAN: 'Penyuluhan', PELATIHAN: 'Pelatihan', PENDAMPINGAN: 'Pendampingan', LAYANAN_MASYARAKAT: 'Layanan Masyarakat'
};
const jenisPenunjangLabel: Record<string, string> = {
  KEPANITIAAN: 'Kepanitiaan', ORGANISASI_PROFESI: 'Organisasi Profesi', SEMINAR: 'Seminar/Workshop', PELATIHAN: 'Pelatihan/Sertifikasi', TUGAS_TAMBAHAN: 'Tugas Tambahan'
};
const jenisBimbinganLabel: Record<string, string> = {
  SKRIPSI: 'Skripsi', KTI: 'Karya Tulis Ilmiah', PKL: 'Praktik Kerja Lapangan', AKADEMIK: 'Bimbingan Akademik'
};
const statusBimbinganLabel: Record<string, { text: string; color: string }> = {
  BERJALAN: { text: 'Berjalan', color: 'text-blue-600 bg-blue-50' },
  LULUS: { text: 'Lulus', color: 'text-emerald-600 bg-emerald-50' },
  BATAL: { text: 'Batal', color: 'text-rose-600 bg-rose-50' },
};

// --- FORM MODALS ---
function FormModal({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-popup">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label} {required && <span className="text-rose-500">*</span>}</label>
      <select name={name} value={value || ''} onChange={onChange} required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white">
        <option value="">-- Pilih --</option>
        {options.map((opt: { value: string; label: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, name, value, onChange, placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <textarea name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all resize-none" />
    </div>
  );
}

// --- SECTION COMPONENT ---
function Section({ icon: Icon, title, color, count, children, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">{count} data tercatat</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && <div className="border-t border-slate-100 p-6">{children}</div>}
    </div>
  );
}

// --- MAIN PAGE ---
export default function PortofolioPage() {
  const { id } = useParams() as { id: string };
  const [employee, setEmployee] = useState<any>(null);
  const [penelitians, setPenelitians] = useState<any[]>([]);
  const [pengabdians, setPengabdians] = useState<any[]>([]);
  const [penunjangs, setPenunjangs] = useState<any[]>([]);
  const [bimbingans, setBimbingans] = useState<any[]>([]);
  const [teachings, setTeachings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [empRes, penRes, abdRes, tunjRes, bimRes, teachRes] = await Promise.all([
        fetch(`/api/employees/${id}`).then(r => r.json()),
        fetch(`/api/employees/${id}/penelitian`).then(r => r.json()),
        fetch(`/api/employees/${id}/pengabdian`).then(r => r.json()),
        fetch(`/api/employees/${id}/penunjang`).then(r => r.json()),
        fetch(`/api/employees/${id}/bimbingan`).then(r => r.json()),
        fetch(`/api/employees/${id}/teaching`).then(r => r.json()),
      ]);
      setEmployee(empRes);
      if (penRes.success) setPenelitians(penRes.data);
      if (abdRes.success) setPengabdians(abdRes.data);
      if (tunjRes.success) setPenunjangs(tunjRes.data);
      if (bimRes.success) setBimbingans(bimRes.data);
      if (teachRes.success) setTeachings(teachRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (endpoint: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(null);
        setFormData({});
        fetchAll();
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Memuat portofolio...</p>
        </div>
      </div>
    );
  }

  const namaLengkap = `${employee?.gelarDepan ? employee.gelarDepan + ' ' : ''}${employee?.nama || ''}${employee?.gelarBelakang ? ', ' + employee.gelarBelakang : ''}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link href={`/pegawai/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Profil
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Portofolio BKD</h1>
          <p className="text-slate-500 font-medium mt-1">{namaLengkap} — {employee?.nidn ? `NIDN: ${employee.nidn}` : employee?.nip ? `NIP: ${employee.nip}` : ''}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Mengajar', count: teachings.length, icon: BookOpen, color: 'blue' },
          { label: 'Penelitian', count: penelitians.length, icon: FlaskConical, color: 'purple' },
          { label: 'Pengabdian', count: pengabdians.length, icon: HandHeart, color: 'emerald' },
          { label: 'Penunjang', count: penunjangs.length, icon: Award, color: 'amber' },
          { label: 'Bimbingan', count: bimbingans.length, icon: GraduationCap, color: 'rose' },
        ].map((s) => {
          const colorMap: Record<string, string> = { blue: 'text-blue-600', purple: 'text-purple-600', emerald: 'text-emerald-600', amber: 'text-amber-600', rose: 'text-rose-600' };
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${colorMap[s.color]}`} />
              <p className="text-2xl font-black text-slate-900">{s.count}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* === PENDIDIKAN === */}
      <Section icon={BookOpen} title="Pendidikan & Pengajaran" color="blue" count={teachings.length + bimbingans.length} defaultOpen={true}>
        <div className="space-y-6">
          {/* Mengajar */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Riwayat Mengajar</h3>
            {teachings.length > 0 ? (
              <div className="space-y-2">
                {teachings.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.mataKuliah}</p>
                      <p className="text-xs text-slate-500">{t.programStudi} — {t.semester} {t.tahunAkademik} • {t.sks} SKS</p>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{t.kelas || '-'}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">Belum ada data mengajar.</p>}
          </div>

          {/* Bimbingan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bimbingan Mahasiswa</h3>
              <button onClick={() => { setShowForm('bimbingan'); setFormData({}); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
            {bimbingans.length > 0 ? (
              <div className="space-y-2">
                {bimbingans.map((b: any) => (
                  <div key={b.id} className="bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{b.namaMahasiswa} <span className="text-slate-400 font-normal">({b.nim || '-'})</span></p>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusBimbinganLabel[b.status]?.color || 'bg-slate-50 text-slate-600'}`}>
                        {statusBimbinganLabel[b.status]?.text || b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{jenisBimbinganLabel[b.jenisBimbingan] || b.jenisBimbingan} — {b.peranDosen?.replace(/_/g, ' ')} • {b.semester} {b.tahunAkademik}</p>
                    {b.judulTugas && <p className="text-xs text-slate-600 mt-1 italic">"{b.judulTugas}"</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">Belum ada data bimbingan.</p>}
          </div>
        </div>
      </Section>

      {/* === PENELITIAN === */}
      <Section icon={FlaskConical} title="Penelitian & Publikasi" color="purple" count={penelitians.length}>
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => { setShowForm('penelitian'); setFormData({}); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Penelitian
          </button>
        </div>
        {penelitians.length > 0 ? (
          <div className="space-y-3">
            {penelitians.map((p: any) => (
              <div key={p.id} className="bg-slate-50 rounded-xl px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{p.judul}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {jenisPenelitianLabel[p.jenisPenelitian] || p.jenisPenelitian} • {p.tahun}
                      {p.namaJurnal && ` • ${p.namaJurnal}`}
                      {p.isInternasional && ' 🌍 Internasional'}
                    </p>
                    {p.volume && <p className="text-xs text-slate-400 mt-0.5">Vol. {p.volume}{p.nomor ? `, No. ${p.nomor}` : ''}{p.halaman ? `, Hal. ${p.halaman}` : ''}</p>}
                  </div>
                  <div className="flex gap-2">
                    {p.url && <a href={p.url} target="_blank" rel="noopener" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><ExternalLink className="w-4 h-4" /></a>}
                    {p.filePath && <a href={p.filePath} target="_blank" className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><FileText className="w-4 h-4" /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400 italic">Belum ada data penelitian.</p>}
      </Section>

      {/* === PENGABDIAN === */}
      <Section icon={HandHeart} title="Pengabdian kepada Masyarakat" color="emerald" count={pengabdians.length}>
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => { setShowForm('pengabdian'); setFormData({}); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Pengabdian
          </button>
        </div>
        {pengabdians.length > 0 ? (
          <div className="space-y-3">
            {pengabdians.map((p: any) => (
              <div key={p.id} className="bg-slate-50 rounded-xl px-4 py-4">
                <p className="text-sm font-bold text-slate-900">{p.judul}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {jenisPengabdianLabel[p.jenisPengabdian] || p.jenisPengabdian} • {p.peranDosen?.replace(/_/g, ' ')}
                  {p.tempatPelaksanaan && ` • ${p.tempatPelaksanaan}`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.tanggalMulai)} — {formatDate(p.tanggalSelesai)}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400 italic">Belum ada data pengabdian.</p>}
      </Section>

      {/* === PENUNJANG === */}
      <Section icon={Award} title="Kegiatan Penunjang" color="amber" count={penunjangs.length}>
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => { setShowForm('penunjang'); setFormData({}); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Penunjang
          </button>
        </div>
        {penunjangs.length > 0 ? (
          <div className="space-y-3">
            {penunjangs.map((p: any) => (
              <div key={p.id} className="bg-slate-50 rounded-xl px-4 py-4">
                <p className="text-sm font-bold text-slate-900">{p.judul}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {jenisPenunjangLabel[p.jenisPenunjang] || p.jenisPenunjang} • {p.peran || '-'}
                  {p.lembaga && ` • ${p.lembaga}`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(p.tanggalMulai)} — {formatDate(p.tanggalSelesai)}
                  {p.nomorSK && ` • SK: ${p.nomorSK}`}
                </p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400 italic">Belum ada data penunjang.</p>}
      </Section>

      {/* ==== FORM MODALS ==== */}

      {/* Form Penelitian */}
      <FormModal title="Tambah Penelitian" isOpen={showForm === 'penelitian'} onClose={() => setShowForm(null)}>
        <InputField label="Judul" name="judul" value={formData.judul} onChange={handleChange} required />
        <SelectField label="Jenis" name="jenisPenelitian" value={formData.jenisPenelitian} onChange={handleChange} required
          options={Object.entries(jenisPenelitianLabel).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Nama Jurnal/Prosiding" name="namaJurnal" value={formData.namaJurnal} onChange={handleChange} placeholder="Contoh: Jurnal Kesehatan Masyarakat" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tahun" name="tahun" value={formData.tahun} onChange={handleChange} type="number" required />
          <InputField label="Penerbit" name="penerbit" value={formData.penerbit} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <InputField label="Volume" name="volume" value={formData.volume} onChange={handleChange} />
          <InputField label="Nomor" name="nomor" value={formData.nomor} onChange={handleChange} />
          <InputField label="Halaman" name="halaman" value={formData.halaman} onChange={handleChange} placeholder="10-25" />
        </div>
        <InputField label="URL / DOI" name="url" value={formData.url} onChange={handleChange} placeholder="https://doi.org/..." />
        <SelectField label="Peran Penulis" name="peranPenulis" value={formData.peranPenulis} onChange={handleChange}
          options={[{ value: 'PENULIS_UTAMA', label: 'Penulis Utama' }, { value: 'ANGGOTA', label: 'Anggota / Co-Author' }]} />
        <InputField label="Link Repository / Bukti" name="linkRepository" value={formData.linkRepository} onChange={handleChange} placeholder="https://repository.stikes-baktara.ac.id/..." />
        <TextareaField label="Catatan" name="catatan" value={formData.catatan} onChange={handleChange} />
        <button onClick={() => handleSubmit('penelitian')} disabled={saving}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan Penelitian'}
        </button>
      </FormModal>

      {/* Form Pengabdian */}
      <FormModal title="Tambah Pengabdian" isOpen={showForm === 'pengabdian'} onClose={() => setShowForm(null)}>
        <InputField label="Judul Kegiatan" name="judul" value={formData.judul} onChange={handleChange} required />
        <SelectField label="Jenis" name="jenisPengabdian" value={formData.jenisPengabdian} onChange={handleChange} required
          options={Object.entries(jenisPengabdianLabel).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Tempat Pelaksanaan" name="tempatPelaksanaan" value={formData.tempatPelaksanaan} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tanggal Mulai" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange} type="date" required />
          <InputField label="Tanggal Selesai" name="tanggalSelesai" value={formData.tanggalSelesai} onChange={handleChange} type="date" />
        </div>
        <SelectField label="Peran Dosen" name="peranDosen" value={formData.peranDosen} onChange={handleChange}
          options={[{ value: 'KETUA', label: 'Ketua' }, { value: 'ANGGOTA', label: 'Anggota' }]} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Sumber Dana" name="sumberDana" value={formData.sumberDana} onChange={handleChange}
            options={[{ value: 'MANDIRI', label: 'Mandiri' }, { value: 'INSTITUSI', label: 'Institusi' }, { value: 'DIKTI', label: 'Dikti/Pemerintah' }, { value: 'LAINNYA', label: 'Lainnya' }]} />
          <InputField label="Jumlah Dana" name="jumlahDana" value={formData.jumlahDana} onChange={handleChange} type="number" placeholder="Rp" />
        </div>
        <InputField label="Link Repository / Bukti" name="linkRepository" value={formData.linkRepository} onChange={handleChange} placeholder="https://..." />
        <TextareaField label="Catatan" name="catatan" value={formData.catatan} onChange={handleChange} />
        <button onClick={() => handleSubmit('pengabdian')} disabled={saving}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan Pengabdian'}
        </button>
      </FormModal>

      {/* Form Penunjang */}
      <FormModal title="Tambah Penunjang" isOpen={showForm === 'penunjang'} onClose={() => setShowForm(null)}>
        <InputField label="Nama Kegiatan / Jabatan" name="judul" value={formData.judul} onChange={handleChange} required />
        <SelectField label="Jenis" name="jenisPenunjang" value={formData.jenisPenunjang} onChange={handleChange} required
          options={Object.entries(jenisPenunjangLabel).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Peran" name="peran" value={formData.peran} onChange={handleChange} placeholder="Ketua Panitia / Anggota / Peserta / Pemateri" />
        <InputField label="Lembaga Penyelenggara" name="lembaga" value={formData.lembaga} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tanggal Mulai" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange} type="date" required />
          <InputField label="Tanggal Selesai" name="tanggalSelesai" value={formData.tanggalSelesai} onChange={handleChange} type="date" />
        </div>
        <InputField label="Nomor SK" name="nomorSK" value={formData.nomorSK} onChange={handleChange} />
        <InputField label="Link Repository / Bukti" name="linkRepository" value={formData.linkRepository} onChange={handleChange} placeholder="https://..." />
        <TextareaField label="Catatan" name="catatan" value={formData.catatan} onChange={handleChange} />
        <button onClick={() => handleSubmit('penunjang')} disabled={saving}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan Penunjang'}
        </button>
      </FormModal>

      {/* Form Bimbingan */}
      <FormModal title="Tambah Bimbingan Mahasiswa" isOpen={showForm === 'bimbingan'} onClose={() => setShowForm(null)}>
        <InputField label="Nama Mahasiswa" name="namaMahasiswa" value={formData.namaMahasiswa} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="NIM" name="nim" value={formData.nim} onChange={handleChange} />
          <InputField label="Program Studi" name="programStudi" value={formData.programStudi} onChange={handleChange} />
        </div>
        <SelectField label="Jenis Bimbingan" name="jenisBimbingan" value={formData.jenisBimbingan} onChange={handleChange} required
          options={Object.entries(jenisBimbinganLabel).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Judul Tugas / Skripsi" name="judulTugas" value={formData.judulTugas} onChange={handleChange} />
        <SelectField label="Peran Dosen" name="peranDosen" value={formData.peranDosen} onChange={handleChange}
          options={[{ value: 'PEMBIMBING_UTAMA', label: 'Pembimbing Utama' }, { value: 'PEMBIMBING_PENDAMPING', label: 'Pembimbing Pendamping' }, { value: 'PENGUJI', label: 'Penguji' }]} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Semester" name="semester" value={formData.semester} onChange={handleChange}
            options={[{ value: 'Ganjil', label: 'Ganjil' }, { value: 'Genap', label: 'Genap' }]} />
          <InputField label="Tahun Akademik" name="tahunAkademik" value={formData.tahunAkademik} onChange={handleChange} placeholder="2025/2026" />
        </div>
        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange}
          options={[{ value: 'BERJALAN', label: 'Berjalan' }, { value: 'LULUS', label: 'Lulus' }, { value: 'BATAL', label: 'Batal' }]} />
        <TextareaField label="Catatan" name="catatan" value={formData.catatan} onChange={handleChange} />
        <button onClick={() => handleSubmit('bimbingan')} disabled={saving}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan Bimbingan'}
        </button>
      </FormModal>
    </div>
  );
}
