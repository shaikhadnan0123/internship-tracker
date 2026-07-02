import { Home, Bell, User, Search, Briefcase } from 'lucide-react';
import AiIcon from './AiIcon';
import { Profile } from '../types';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotificationsCount: number;
  profile: Profile;
}

export default function Navbar({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  unreadNotificationsCount,
  profile
}: NavbarProps) {
  const navItems = [
    { id: 'feed', label: 'Dashboard', icon: Home, badge: 0 },
    { id: 'tracker', label: 'Tracker', icon: Briefcase, badge: 0 },
    { id: 'notifications', label: 'Updates', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Profile', icon: User, badge: 0, isProfile: true }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full liquid-glass-navbar" id="ln-navbar">
      <div className="max-w-[95%] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-6 transition-all duration-300" id="ln-navbar-container">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0" id="ln-navbar-left">
          <button 
            onClick={() => setActiveView('feed')} 
            className="flex items-center gap-2 hover:opacity-95 transition-all duration-300 group"
            title="internAi Home"
            id="ln-logo-btn"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <AiIcon className="w-8 h-8 text-indigo-400 group-hover:scale-105 transition-transform duration-300" />
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col items-start leading-none">
              <div className="flex items-center">
                <span className="text-lg font-black text-white tracking-tight">intern</span>
                <span className="text-lg font-black text-indigo-400 tracking-tight">Ai</span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-400 mt-0.5">Learn • Grow • Succeed</span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links (Rearranged and Centered) */}
        <nav className="flex items-center md:gap-4 lg:gap-6 h-full justify-center flex-1 max-w-md mx-auto" id="ln-main-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSearchQuery(''); // clear search on view transition
                }}
                className={`relative flex flex-col items-center justify-center h-full px-3.5 cursor-pointer transition-colors border-b-2 hover:text-slate-900 ${
                  isActive 
                    ? 'border-slate-950 text-slate-950 font-black scale-102' 
                    : 'border-transparent text-slate-500 hover:text-slate-850'
                }`}
                id={`ln-nav-tab-${item.id}`}
              >
                <div className="relative flex items-center justify-center">
                  {item.isProfile ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile Avatar" 
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  {item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-bold rounded-full px-1 text-[9px] min-w-[14px] h-[14px] flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:block mt-1">
                  {item.label}
                  {item.isProfile && ' ▾'}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl flex items-center shrink-0 transition-all duration-300" id="ln-navbar-right">
          <div className="absolute left-3.5 pointer-events-none flex items-center gap-1.5 text-slate-200 z-10">
            <Search className="w-4 h-4 text-slate-200" />
            <span className="w-[1px] h-3 bg-slate-500/50"></span>
            <AiIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <input
            type="text"
            placeholder="Search with Ai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full liquid-glass-input text-sm text-slate-855 pl-16 pr-12 py-2 rounded-xl outline-none placeholder-slate-400 border border-slate-200/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-150 transition-all duration-200"
            id="ln-global-search"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
