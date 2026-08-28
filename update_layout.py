import re

with open('src/app/(dashboard)/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Header
header_pattern = r'(<header.*?>)(.*?)(</header>)'
new_header = '''<header className="h-[76px] shrink-0 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 z-30 sticky top-0 shadow-sm">
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
                      className={lock px-4 py-3 border-b border-slate-50 transition-colors }
                    >
                      <p className={	ext-sm }>Dokumen SK Mengajar perlu diperbarui.</p>
                      <p className="text-xs text-slate-500 mt-1">2 jam yang lalu</p>
                    </Link>
                    <Link 
                      href="/presensi"
                      onClick={() => { setIsNotificationOpen(false); setHasUnreadNotifs(false); }}
                      className={lock px-4 py-3 border-b border-slate-50 transition-colors }
                    >
                      <p className={	ext-sm }>Presensi masuk hari ini berhasil direkam.</p>
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
        </header>'''

# Apply the regex substitution for Header with flags to match multiple lines
content = re.sub(r'<header.*?</header>', new_header, content, flags=re.DOTALL)

# Replace Main Content to add Footer
main_pattern = r'(<main.*?>)(.*?)(</main>)'
new_main = r'''\1
          <div className="flex-1">
            \2
          </div>
          
          {/* Beautiful Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-[10px]">S</div>
              <p className="text-sm font-semibold text-slate-500">&copy; {new Date().getFullYear()} STIKES Baktara.</p>
            </div>
            <div className="flex gap-5 text-sm font-semibold text-slate-500">
              <Link href="/bantuan" className="hover:text-blue-600 transition-colors">Pusat Bantuan</Link>
              <Link href="/pengaturan" className="hover:text-blue-600 transition-colors">Privasi</Link>
            </div>
          </footer>
        \3'''

content = re.sub(main_pattern, new_main, content, flags=re.DOTALL)

with open('src/app/(dashboard)/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
