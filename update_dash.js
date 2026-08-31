const fs = require('fs');
const file = 'src/app/(dashboard)/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCards =         <StatCard 
          title="Total Pegawai" 
          value={loading ? "..." : stats?.totalPegawai || 0} 
          icon={<UsersIcon className="w-10 h-10 text-white" />}
          bgColor="bg-[#4ADE80]"
          textColor="text-white"
          desc="Pegawai aktif"
          loading={loading}
        />
        <StatCard 
          title="Total Kategori" 
          value={loading ? "..." : 5} 
          icon={<FolderIcon className="w-10 h-10 text-white" />}
          bgColor="bg-[#F97316]"
          textColor="text-white"
          desc="Kategori digunakan"
          loading={loading}
        />;

const newCards =         {stats?.role === 'ADMIN' || stats?.role === 'PIMPINAN' ? (
          <>
            <StatCard 
              title="Total Pegawai" 
              value={loading ? "..." : stats?.totalPegawai || 0} 
              icon={<UsersIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#4ADE80]"
              textColor="text-white"
              desc="Pegawai aktif"
              loading={loading}
            />
            <StatCard 
              title="Total Kategori" 
              value={loading ? "..." : 5} 
              icon={<FolderIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#F97316]"
              textColor="text-white"
              desc="Kategori digunakan"
              loading={loading}
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Dokumen Saya" 
              value={loading ? "..." : stats?.myTotalDokumen || 0} 
              icon={<FileIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#4ADE80]"
              textColor="text-white"
              desc="Dokumen yang diunggah"
              loading={loading}
            />
            <StatCard 
              title="Presensi Hari Ini" 
              value={loading ? "..." : (stats?.myPresensiHariIni ? "Hadir" : "Belum Hadir")} 
              icon={<UserCheckIcon className="w-10 h-10 text-white" />}
              bgColor="bg-[#F97316]"
              textColor="text-white"
              desc={loading ? "..." : (stats?.myPresensiHariIni ? "Presensi tercatat" : "Silakan absen masuk")}
              loading={loading}
            />
          </>
        )};

code = code.replace(oldCards, newCards);

const newIcon = unction UserCheckIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
}

function PlusIcon(props: any) {;

code = code.replace('function PlusIcon(props: any) {', newIcon);

fs.writeFileSync(file, code);
console.log('Update success');
