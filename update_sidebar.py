import re

with open('src/app/(dashboard)/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace aside
aside_pattern = r'(<aside.*?</aside>)'

new_aside = r"""<aside 
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
          <div>
            <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              Menu Utama
            </p>
            <div className="space-y-1.5">
              {navItemsUtama.map((item) => {
                let isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                // Special case: don't highlight "Presensi" if we are in "Rekap Presensi"
                if (item.href === '/presensi' && pathname.startsWith('/presensi/rekap')) {
                  isActive = false;
                }
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
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

          <div>
            <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              Lainnya
            </p>
            <div className="space-y-1.5">
              {navItemsLainnya.map((item) => {
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
      </aside>"""

content = re.sub(aside_pattern, new_aside, content, flags=re.DOTALL)

with open('src/app/(dashboard)/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar updated successfully!")
