import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  const [clickCount, setClickCount] = useState(0);

  const handleAdminEasterEgg = () => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      navigate('/secure-admin-login');
      setClickCount(0);
    } else {
      setClickCount(newCount);
    }
  };

  const navItems = [
    { name: 'Biography', path: '/' },
    { name: 'Publications', path: '/publications' },
    { name: 'Gallery', path: '/gallery' }
  ];

  if (loading) {
    return (
      <aside className="w-full md:w-[320px] bg-[#006633] text-white flex flex-col p-8 shrink-0 shadow-2xl h-full animate-pulse">
        <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-emerald-800 mb-6 mx-auto"></div>
        <div className="h-6 bg-white/20 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-[320px] md:h-screen md:sticky top-0 bg-[#006633] text-white flex flex-col p-8 shrink-0 md:shadow-2xl z-20">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-32 h-32 rounded-full border-[6px] border-[#E8F3EE]/20 bg-emerald-800 mb-6 flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-lg">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="University Logo" className="w-full h-full object-contain p-2 bg-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-800 text-white">
              <GraduationCap size={56} className="opacity-80" />
            </div>
          )}
        </div>
        <h1 
          className="text-2xl font-serif font-bold leading-tight tracking-wide cursor-default select-none drop-shadow-md"
          onClick={handleAdminEasterEgg}
        >
          {profile?.name}
        </h1>
        <p className="text-xs text-emerald-200 mt-2 opacity-90 uppercase tracking-[0.15em] font-medium">{profile?.title}</p>
      </div>

      <nav className="flex-grow space-y-5 pt-8 border-t border-emerald-800/50 hidden md:block">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-4 text-sm font-medium cursor-pointer transition-all duration-300 ${isActive ? 'text-white translate-x-1' : 'text-emerald-300 hover:text-white hover:translate-x-1'}`}
            >
              {isActive ? (
                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              ) : (
                <span className="w-2 h-2 bg-transparent rounded-full"></span>
              )}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Nav */}
      <nav className="flex flex-wrap gap-6 mt-6 justify-center border-t border-emerald-800/50 pt-6 md:hidden">
         {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`text-sm font-medium transition-colors pb-1 ${isActive ? 'text-white border-b-2 border-emerald-400' : 'text-emerald-300 hover:text-white'}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-emerald-800/50 flex flex-col items-center md:items-start space-y-4">
        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-900/50 rounded-full border border-emerald-800/50 text-[10px] uppercase font-bold text-emerald-400 tracking-widest shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
          <ShieldCheck size={14} />
          SafeLine WAF
        </div>
        <div className="text-[11px] space-y-2 opacity-70 text-center md:text-left font-medium tracking-wider w-full">
          {profile?.email && <p>Email: {profile.email}</p>}
          <p>Cirebon, West Java, Indonesia</p>
        </div>
      </div>
    </aside>
  );
}
