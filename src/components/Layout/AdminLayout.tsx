import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, FileText, Users, Settings, LogOut, ShieldCheck, Mail, User, Activity, Shield, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Activité Récente', path: '/admin/activity', icon: Activity },
    { name: 'Sécurité', path: '/admin/security', icon: Shield },
    { name: 'Gérer les Quiz', path: '/admin/quizzes', icon: FileText },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Mon Profil', path: '/admin/profile', icon: User },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar - Violet Theme */}
      <aside className={cn(
        "w-64 border-r border-[#7c3aed30] flex flex-col fixed h-full bg-[#0a0f1d] z-50 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 sm:p-8 flex items-center gap-3 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#7c3aed] p-2 rounded-xl shadow-lg shadow-[#7c3aed]/30">
              <ShieldCheck size={20} className="text-white sm:size-7" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl tracking-tighter block leading-none">IT HUB</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#7c3aed] font-black">Control Panel</span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-[#7c3aed] hover:bg-[#7c3aed10] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 sm:py-4 rounded-xl transition-all duration-300 group',
                  isActive 
                    ? 'bg-[#7c3aed] text-white shadow-xl shadow-[#7c3aed]/20 translate-x-1' 
                    : 'text-[#6366f1]/60 hover:bg-[#7c3aed10] hover:text-[#a5b4fc]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={cn(isActive ? 'text-white' : 'group-hover:text-[#7c3aed] sm:size-5')} />
                  <span className="font-bold text-xs sm:text-sm tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 sm:p-6 border-t border-[#7c3aed10]">
          {/* <div className="bg-[#7c3aed05] p-3 sm:p-4 rounded-2xl border border-[#7c3aed15] mb-4">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center font-black text-white shadow-lg text-xs sm:text-sm">
                  {user?.first_name?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-xs font-black text-white truncate uppercase">{user?.first_name} {user?.last_name}</p>
                  <p className="text-[8px] sm:text-[9px] text-[#7c3aed] font-medium tracking-widest uppercase">System Admin</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-[#475569] font-mono">
                <Mail size={10} className="sm:size-5" />
                <span className="truncate">{user?.email}</span>
             </div>
          </div> */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
          >
            <LogOut size={14} className="sm:size-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col lg:ml-64">
        {/* Admin Header */}
        <header className="h-16 sm:h-20 border-b border-[#7c3aed15] sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#7c3aed] hover:bg-[#7c3aed10] rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">Panel Admin</h1>
            <div className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-lg animate-pulse hidden sm:block">ADMIN</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[9px] sm:text-[10px] font-black text-[#6366f1] uppercase tracking-[0.2em] mb-0.5">System Status</p>
              <div className="flex items-center justify-end gap-1.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                 <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase">All Systems Operational</span>
              </div>
            </div>
            <div className="h-6 sm:h-8 w-px bg-[#7c3aed15] mx-2 sm:mx-4 hidden sm:block" />
            <button
              onClick={() => navigate('/admin/profile')}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white p-2 rounded-lg shadow-lg shadow-[#7c3aed]/20 transition-all active:scale-95"
            >
              <User size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
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

      {/* Modal Profil Admin */}
      
    </div>
  );
};
