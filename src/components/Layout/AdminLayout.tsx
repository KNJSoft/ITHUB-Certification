import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, FileText, Users, Settings, LogOut, ShieldCheck, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Gérer les Quiz', path: '/admin/quizzes', icon: FileText },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex">
      {/* Admin Sidebar - Violet Theme */}
      <aside className="w-64 border-r border-[#7c3aed30] flex flex-col fixed h-full bg-[#0a0f1d] z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-[#7c3aed] p-2 rounded-xl shadow-lg shadow-[#7c3aed]/30">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter block leading-none">HUB</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7c3aed] font-black">Control Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 group',
                  isActive 
                    ? 'bg-[#7c3aed] text-white shadow-xl shadow-[#7c3aed]/20 translate-x-1' 
                    : 'text-[#6366f1]/60 hover:bg-[#7c3aed10] hover:text-[#a5b4fc]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn(isActive ? 'text-white' : 'group-hover:text-[#7c3aed]')} />
                  <span className="font-bold text-sm tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-[#7c3aed10]">
          <div className="bg-[#7c3aed05] p-4 rounded-2xl border border-[#7c3aed15] mb-4">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c3aed] flex items-center justify-center font-black text-white shadow-lg">
                  {user?.name?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-white truncate uppercase">{user?.name}</p>
                  <p className="text-[9px] text-[#7c3aed] font-medium tracking-widest uppercase">System Admin</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#475569] font-mono">
                <Mail size={12} />
                <span className="truncate">{user?.email}</span>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Admin Header */}
        <header className="h-20 border-b border-[#7c3aed15] sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Panel Admin — IT HUB</h1>
            <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg animate-pulse">ADMIN</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-[0.2em] mb-0.5">System Status</p>
              <div className="flex items-center justify-end gap-1.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                 <span className="text-[10px] font-bold text-emerald-500 uppercase">All Systems Operational</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#7c3aed15] mx-4" />
            <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-[#7c3aed]/20 transition-all active:scale-95">
              Live View
            </button>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
