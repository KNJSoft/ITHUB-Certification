import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, BookOpen, Award, User, LogOut, Code2, Bell, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/app/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Mes Quiz', path: '/app/quizzes', icon: BookOpen }, // Added as requested
    { name: 'Certifications', path: '/app/certifications', icon: Award },
    { name: 'Profil', path: '/app/profile', icon: User },
  ];

  const firstName = user?.first_name?.split(' ')[0] || 'Utilisateur';

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

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-[#1e293b] flex flex-col fixed h-full bg-[#0f172a] z-50 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 sm:p-8 flex items-center gap-3 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#2563eb] p-2 rounded-xl shadow-lg shadow-[#2563eb]/20">
              <Code2 size={20} className="text-white sm:size-24" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tighter">IT HUB</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-[#2563eb] hover:bg-[#2563eb10] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-200 group relative',
                  isActive 
                    ? 'bg-[#2563eb] text-white shadow-xl shadow-[#2563eb]/20' 
                    : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc]'
                )
              }
            >
              <item.icon size={18} className="sm:size-20" />
              <span className="font-semibold text-xs sm:text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e293b]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[#ef4444] hover:bg-[#ef444410] transition-all duration-200"
          >
            <LogOut size={16} className="sm:size-20" />
            <span className="font-bold text-xs sm:text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col lg:ml-64">
        {/* Student Header */}
        <header className="h-16 sm:h-20 border-b border-[#1e293b] sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#2563eb] hover:bg-[#2563eb10] rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
                Bonjour, {firstName} 👋
              </h2>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#2563eb] font-black">Plateforme Étudiant</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2 text-[#94a3b8] hover:text-white transition-colors relative">
               <Bell size={18} className="sm:size-20" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563eb] rounded-full border-2 border-[#0f172a]" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] sm:text-xs font-bold text-[#f8fafc]">{user?.first_name} {user?.last_name}</p>
                <p className="text-[9px] sm:text-[10px] text-[#94a3b8]">Student Level 1</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center font-black text-white shadow-lg group-hover:scale-105 transition-transform text-xs sm:text-sm">
                {user?.first_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
