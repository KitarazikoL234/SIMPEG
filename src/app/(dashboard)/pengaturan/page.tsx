'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, User, Shield, Clock, Bell, Database, ChevronRight, Save, Fingerprint, Trash2, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PengaturanPage() {
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [saved, setSaved] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [webauthnCreds, setWebauthnCreds] = useState<any[]>([]);
  const [webauthnLoading, setWebauthnLoading] = useState(false);
  const [webauthnMsg, setWebauthnMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const savedMulai = localStorage.getItem('jamMulaiKerja');
    const savedSelesai = localStorage.getItem('jamSelesaiKerja');
    if (savedMulai) setJamMulai(savedMulai);
    if (savedSelesai) setJamSelesai(savedSelesai);

    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) setUserData(d.user);
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem('jamMulaiKerja', jamMulai);
    localStorage.setItem('jamSelesaiKerja', jamSelesai);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Fetch registered credentials
  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/webauthn/credentials');
      const json = await res.json();
      if (json.success) setWebauthnCreds(json.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (userData) fetchCredentials();
  }, [userData]);

  // Register new fingerprint
  const handleRegisterFingerprint = async () => {
    setWebauthnLoading(true);
    setWebauthnMsg(null);
    try {
      // Check browser support
      if (!window.PublicKeyCredential) {
        setWebauthnMsg({ type: 'error', text: 'Browser Anda tidak mendukung WebAuthn/Sidik Jari.' });
        setWebauthnLoading(false);
        return;
      }

      // 1. Get registration options from server
      const optRes = await fetch('/api/webauthn/register/options', { method: 'POST' });
      const optJson = await optRes.json();
      if (!optJson.success) throw new Error(optJson.error);

      const options = optJson.options;

      // 2. Convert base64url values to ArrayBuffer
      const challengeBuffer = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const userIdBuffer = Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

      const excludeCredentials = (options.excludeCredentials || []).map((cred: any) => ({
        ...cred,
        id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
      }));

      // 3. Call WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: { name: options.rp.name, id: window.location.hostname },
          user: {
            id: userIdBuffer,
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: options.timeout,
          authenticatorSelection: options.authenticatorSelection,
          attestation: options.attestation,
          excludeCredentials,
        }
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Pendaftaran dibatalkan');

      const response = credential.response as AuthenticatorAttestationResponse;

      // 4. Convert credential data to base64url for storage
      const credentialIdB64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey()!)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // 5. Save to server
      const verifyRes = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: credentialIdB64,
          publicKey: publicKeyB64,
          counter: 0,
          deviceType: 'platform',
          transports: response.getTransports?.() || ['internal'],
        })
      });

      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) throw new Error(verifyJson.error);

      setWebauthnMsg({ type: 'success', text: '✅ Sidik jari berhasil didaftarkan! Anda sekarang bisa login menggunakan sidik jari.' });
      fetchCredentials();
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setWebauthnMsg({ type: 'error', text: 'Pendaftaran dibatalkan oleh pengguna.' });
      } else {
        setWebauthnMsg({ type: 'error', text: e.message || 'Gagal mendaftarkan sidik jari.' });
      }
    }
    setWebauthnLoading(false);
  };

  // Delete a credential
  const handleDeleteCredential = async (id: string) => {
    if (!confirm('Hapus sidik jari ini? Anda tidak akan bisa login menggunakan perangkat ini lagi.')) return;
    try {
      await fetch(`/api/webauthn/credentials?id=${id}`, { method: 'DELETE' });
      fetchCredentials();
      setWebauthnMsg({ type: 'success', text: 'Sidik jari berhasil dihapus.' });
    } catch (e) {
      setWebauthnMsg({ type: 'error', text: 'Gagal menghapus sidik jari.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-lg text-slate-500 mt-1">Kelola pengaturan akun dan sistem</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl text-lg font-medium flex items-center gap-2">
          ✅ Pengaturan berhasil disimpan!
        </div>
      )}

      {/* Profil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" /> Informasi Akun
          </h2>
        </div>
        <div className="p-8">
          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-medium text-slate-500 mb-2">Nama</label>
                <p className="text-xl font-semibold text-slate-900">{userData.nama}</p>
              </div>
              <div>
                <label className="block text-base font-medium text-slate-500 mb-2">Email / Username</label>
                <p className="text-xl font-semibold text-slate-900">{userData.email}</p>
              </div>
              <div>
                <label className="block text-base font-medium text-slate-500 mb-2">Role</label>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold bg-blue-100 text-blue-700">
                  <Shield className="w-5 h-5" /> {userData.role}
                </span>
              </div>
              <div>
                <label className="block text-base font-medium text-slate-500 mb-2">Status</label>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold bg-green-100 text-green-700">
                  ✓ Aktif
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-lg">Memuat data akun...</div>
          )}
        </div>
      </div>

      {/* Jadwal Kerja */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" /> Jadwal Kerja
          </h2>
        </div>
        <div className="p-8">
          <p className="text-slate-500 text-base mb-6">Atur jam kerja untuk referensi presensi. Disimpan di perangkat ini.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-3">Jam Mulai Kerja</label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-4 text-xl border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-3">Jam Selesai Kerja</label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-4 text-xl border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-colors flex items-center gap-3"
          >
            <Save className="w-6 h-6" /> Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Integrasi Sistem SISTER */}
      {(userData?.role === 'ADMIN' || userData?.role === 'PIMPINAN') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-amber-500">
          <div className="px-8 py-6 border-b border-slate-100 bg-amber-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-amber-900 flex items-center gap-3">
                <Database className="w-6 h-6 text-amber-600" /> Integrasi SISTER Kemdikbudristek
              </h2>
              <p className="text-sm text-amber-700 mt-1">Konfigurasi Web Service (API) untuk sinkronisasi data Dosen dengan SISTER Pusat.</p>
            </div>
            <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">Coming Soon</span>
          </div>
          <div className="p-8">
            <div className="space-y-6 opacity-70 pointer-events-none">
              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">URL SISTER PT</label>
                <input 
                  type="text" 
                  value="https://sister.kemdiktisaintek.go.id/api.php/0.1" 
                  readOnly
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">URL Endpoint Web Service SISTER kampus Anda (contoh: https://sister.stikes-baktara.ac.id/api.php/0.1)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-slate-700 mb-2">API Client ID (ID Pengguna)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan ID Pengguna WS SISTER..."
                    readOnly
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-slate-700 mb-2">API Client Secret (Password)</label>
                  <input 
                    type="password" 
                    placeholder="Masukkan Password WS SISTER..."
                    readOnly
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  disabled
                  className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl text-base flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Simpan Konfigurasi SISTER
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-medium">
                ℹ️ Fitur ini sedang dalam tahap persiapan. Setelah Admin memasukkan kredensial API SISTER PT, tombol sinkronisasi data akan muncul di halaman profil masing-masing dosen (Riwayat Pendidikan, Tridharma, dsb).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keamanan Sidik Jari / WebAuthn */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
        <div className="px-8 py-6 border-b border-slate-100 bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-emerald-600" /> Login dengan Sidik Jari
          </h2>
          <p className="text-sm text-emerald-700 mt-1">Daftarkan sidik jari atau Face ID perangkat Anda untuk login cepat tanpa password.</p>
        </div>
        <div className="p-8 space-y-6">
          {/* Status Message */}
          {webauthnMsg && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${webauthnMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {webauthnMsg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{webauthnMsg.text}</p>
            </div>
          )}

          {/* Register Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleRegisterFingerprint}
              disabled={webauthnLoading}
              className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {webauthnLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Fingerprint className="w-6 h-6" />
              )}
              {webauthnLoading ? 'Mendaftarkan...' : 'Daftarkan Sidik Jari / Face ID'}
            </button>
            <p className="text-sm text-slate-500">Sensor biometrik bawaan perangkat Anda akan digunakan.</p>
          </div>

          {/* Registered Credentials List */}
          {webauthnCreds.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-700 mb-3">Perangkat Terdaftar ({webauthnCreds.length})</h3>
              <div className="space-y-3">
                {webauthnCreds.map((cred, i) => (
                  <div key={cred.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Perangkat #{i + 1}</p>
                        <p className="text-xs text-slate-500">
                          Didaftarkan: {new Date(cred.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCredential(cred.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus perangkat ini"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {webauthnCreds.length === 0 && !webauthnMsg && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 italic">Belum ada sidik jari yang didaftarkan. Tekan tombol di atas untuk memulai.</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">
              ℹ️ Fitur ini menggunakan teknologi WebAuthn/Passkey. Sidik jari Anda tetap tersimpan aman di perangkat dan tidak pernah dikirim ke server. Yang disimpan hanya kunci digital untuk verifikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Tentang Sistem */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" /> Tentang Sistem
          </h2>
        </div>
        <div className="p-8 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-base text-slate-600">Nama Sistem</span>
            <span className="text-base font-semibold text-slate-900">SIMPEG - STIKES Baktara</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-base text-slate-600">Versi</span>
            <span className="text-base font-semibold text-slate-900">1.0.0</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-base text-slate-600">Framework</span>
            <span className="text-base font-semibold text-slate-900">Next.js 16 + Prisma + SQLite</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-base text-slate-600">Database</span>
            <span className="text-base font-semibold text-slate-900">SQLite (lokal)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
