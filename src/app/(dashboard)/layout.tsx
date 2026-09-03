'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Clock, 
  BarChart3, 
  Settings, 
  Menu, 
  Search, 
  User, 
  LogOut, 
  ChevronDown,
  Camera,
  Bell,
  PieChart,
  LifeBuoy,
  Network
} from 'lucide-react';
import Chatbot from '@/components/Chatbot';

// Extract the nav rendering into a separate component so it can be wrapped in Suspense
function SidebarNav({ 
  navItemsUtama, 
  navItemsLainnya, 
  expandedMenus, 
  toggleSubMenu 
}: any) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <div>
        <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
          Menu Utama
        </p>
        <div className="space-y-1.5">
          {navItemsUtama.map((item: any) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus[item.name];
            
            // Check if active (match exactly, or if sub-items, match starting path)
            const isActive = hasSubItems 
              ? pathname.startsWith(item.href)
              : pathname === item.href;

            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault();
                      toggleSubMenu(item.name);
                    }
                  }}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'}
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.name}
                  </div>
                  {hasSubItems && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </Link>
                
                {hasSubItems && isExpanded && (
                  <div className="ml-5 mt-1 pl-4 border-l border-slate-200 space-y-1">
                    {item.subItems.map((subItem: any) => {
                      // Check if active (match pathname and any query params in href)
                      const [basePath, queryStr] = subItem.href.split('?');
                      const isSubActive = pathname === basePath && (!queryStr || queryStr === `tipe=${searchParams?.get('tipe')}`);
                      
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            relative block px-4 py-2 text-sm rounded-xl transition-all font-medium overflow-hidden
                            ${isSubActive 
                              ? 'text-blue-700 bg-blue-50/80 shadow-sm' 
                              : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}
                          `}
                        >
                          {/* Animated dot indicator for active state */}
                          {isSubActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-pulse"></span>
                          )}
                          <span className={isSubActive ? 'ml-1' : ''}>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
          Lainnya
        </p>
        <div className="space-y-1.5">
          {navItemsLainnya.map((item: any) => {
            const isActive = pathname === item.href && item.name !== 'BKD';
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={(item as any).tooltip}
                className={`
                  group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'}
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [user, setUser] = useState<{ id?: string; nama: string; role: string; email?: string; employeeId?: string } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user session data
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch profile photo
  useEffect(() => {
    if (!user) return;
    const fetchPhoto = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.foto) {
            setProfilePhoto(data.data.foto);
          }
        }
      } catch (e) { /* ignore */ }
    };
    fetchPhoto();
  }, [user]);

  useEffect(() => {
    // Click outside handler for dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isManagement = user?.role === 'ADMIN' || user?.role === 'OPERATOR' || user?.role === 'PIMPINAN';
  const isPimpinan = user?.role === 'PIMPINAN';

  type NavItem = { name: string; href: string; icon: any; subItems?: { name: string; href: string }[] };

  const navItemsUtama: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    // Show Pegawai only for management roles
    ...(isManagement ? [{ 
      name: 'Pegawai', 
      href: '/pegawai', 
      icon: Users,
      subItems: [
        { name: 'Dosen', href: '/pegawai?tipe=DOSEN' },
        { name: 'Tendik', href: '/pegawai?tipe=TENDIK' }
      ]
    }] : []),
    { name: 'Dokumen', href: '/dokumen', icon: FolderOpen },
    { name: 'Presensi', href: '/presensi', icon: Clock },
  ];

  const navItemsLainnya = [
    ...(isPimpinan ? [{ name: 'Laporan', href: '/laporan', icon: PieChart }] : []),
    { name: 'Rekap Presensi', href: '/presensi/rekap', icon: BarChart3 },
    { name: 'Bantuan', href: '/bantuan', icon: LifeBuoy },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/pegawai')) return 'Data Pegawai';
    if (pathname.startsWith('/dokumen')) return 'Dokumen';
    if (pathname.startsWith('/presensi/rekap')) return 'Rekap Presensi';
    if (pathname.startsWith('/presensi')) return 'Presensi';
    if (pathname.startsWith('/profil')) return 'Profil Saya';
    if (pathname.startsWith('/pengaturan')) return 'Pengaturan';
    if (pathname.startsWith('/struktur-organisasi')) return 'Struktur Organisasi';
    return 'SIMPEG';
  };

  const getRoleBadgeColor = (role?: string) => {
    if (role === 'ADMIN') return 'bg-red-100 text-red-700';
    if (role === 'OPERATOR') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] shrink-0 bg-white flex flex-col border-r border-slate-200
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Logo area */}
        <div className="h-[76px] flex items-center px-8 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">SIMPEG</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <Suspense fallback={<div className="p-4 text-slate-400 text-sm">Memuat menu...</div>}>
            <SidebarNav 
              navItemsUtama={navItemsUtama} 
              navItemsLainnya={navItemsLainnya} 
              expandedMenus={expandedMenus} 
              toggleSubMenu={(name: string) => setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }))} 
            />
          </Suspense>
        </nav>

        {/* Sidebar user profile (bottom) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 m-4 rounded-2xl border">
          <Link 
            href="/profil"
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                {user?.nama || 'Memuat...'}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mt-1 inline-block border border-blue-200`}>
                {user?.role || '...'}
              </span>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F3F4F6]">
        {/* Header */}
        <header className="h-[76px] shrink-0 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
              <p className="text-xs font-semibold text-blue-600 mt-0.5 uppercase tracking-wider">Simpeg STIKES Baktara</p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5 relative">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadNotifs && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Notifikasi</h3>
                    <button 
                      onClick={() => setHasUnreadNotifs(false)}
                      className="text-xs text-blue-600 font-medium cursor-pointer hover:underline focus:outline-none"
                    >
                      Tandai sudah dibaca
                    </button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto flex flex-col">
                    <Link 
                      href="/dokumen"
                      onClick={() => { setIsNotificationOpen(false); setHasUnreadNotifs(false); }}
                      className={`block px-4 py-3 border-b border-slate-50 transition-colors ${hasUnreadNotifs ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <p className={`text-sm ${hasUnreadNotifs ? 'text-blue-900 font-semibold' : 'text-slate-800 font-medium'}`}>Dokumen SK Mengajar perlu diperbarui.</p>
                      <p className="text-xs text-slate-500 mt-1">2 jam yang lalu</p>
                    </Link>
                    <Link 
                      href="/presensi"
                      onClick={() => { setIsNotificationOpen(false); setHasUnreadNotifs(false); }}
                      className={`block px-4 py-3 border-b border-slate-50 transition-colors ${hasUnreadNotifs ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <p className={`text-sm ${hasUnreadNotifs ? 'text-blue-900 font-semibold' : 'text-slate-800 font-medium'}`}>Presensi masuk hari ini berhasil direkam.</p>
                      <p className="text-xs text-slate-500 mt-1">Hari ini 07:15</p>
                    </Link>
                  </div>
                  
                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>

            {/* User Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 transition-colors p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-700 font-bold text-sm">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.nama || 'U')
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                    {user?.nama?.split(' ')[0] || '...'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 capitalize truncate max-w-[130px]">
                    {user?.role?.toLowerCase() || 'Memuat...'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block ml-1" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 divide-y divide-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-4 py-4 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.nama}</p>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user?.email || 'N/A'}</p>
                  </div>

                  <div className="py-2">
                    <Link 
                      href="/profil" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-semibold"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      Profil Saya
                    </Link>
                    <Link 
                      href="/pengaturan" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-slate-600" />
                      </div>
                      Pengaturan
                    </Link>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      Keluar dari Sistem
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="flex-1">
            
          {children}
        
          </div>
          
          {/* Beautiful Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 pb-2 sm:pr-20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-[10px]">S</div>
              <p className="text-sm font-semibold text-slate-500">&copy; {new Date().getFullYear()} STIKES Baktara.</p>
            </div>
            <div className="flex gap-5 text-sm font-semibold text-slate-500">
              <Link href="/bantuan" className="hover:text-blue-600 transition-colors">Pusat Bantuan</Link>
              <Link href="/pengaturan" className="hover:text-blue-600 transition-colors">Privasi</Link>
            </div>
          </footer>
        </main>
      </div>

      <Chatbot />
    </div>
  );
}

