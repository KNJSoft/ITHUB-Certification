import React from 'react';
import { User, Mail, Shield, Bell, LogOut, Camera, Award, Phone, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}` : '';

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-2">Mon Profil</h1>
        <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium tracking-wide">Gérez vos informations personnelles et vos préférences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0f1d] border border-[#2563eb10] p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
            <div className="relative group mb-4 sm:mb-6">
              {user?.profile_image_url ? (
                <img 
                  src={user.profile_image_url} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] object-cover shadow-xl shadow-[#2563eb]/20 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-[#2563eb] to-[#4f46e5] flex items-center justify-center font-black text-white text-3xl sm:text-4xl md:text-5xl shadow-xl shadow-[#2563eb]/20 group-hover:scale-105 transition-transform">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 sm:p-3 bg-white text-[#2563eb] rounded-xl shadow-lg hover:scale-110 transition-all">
                <Camera size={14} className="sm:size-18" />
              </button>
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{fullName}</h3>
            <p className="text-[9px] sm:text-[10px] text-[#2563eb] font-black uppercase tracking-[0.2em] mt-1">Étudiant Certifié</p>
            
            <div className="w-full mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#2563eb05] space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm tracking-tight">
                <span className="text-[#64748b] font-bold">Inscrit le:</span>
                <span className="text-white font-black">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        {/*
          <button 
            onClick={logout}
            className="w-full py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 border border-red-500/20"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        */}
        </div>

        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-[#0a0f1d] border border-[#2563eb10] p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <Shield className="text-[#2563eb]" size={16} />
              Informations du compte
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Prénom</label>
                <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                  <User size={14} className="text-[#2563eb] sm:size-18" />
                  <span className="text-white font-bold text-sm sm:text-base">{user?.first_name || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Nom</label>
                <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                  <User size={14} className="text-[#2563eb] sm:size-18" />
                  <span className="text-white font-bold text-sm sm:text-base">{user?.last_name || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Email</label>
                <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                  <Mail size={14} className="text-[#2563eb] sm:size-18" />
                  <span className="text-white font-bold text-sm sm:text-base">{user?.email || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Rôle</label>
                <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                  <Award size={14} className="text-[#2563eb] sm:size-18" />
                  <span className="text-white font-bold capitalize text-sm sm:text-base">{user?.role || 'N/A'}</span>
                </div>
              </div>
              {user?.phone_number && (
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                    <Phone size={14} className="text-[#2563eb] sm:size-18" />
                    <span className="text-white font-bold text-sm sm:text-base">{user.phone_number}</span>
                  </div>
                </div>
              )}
              {user?.country && (
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Pays</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#2563eb10] p-3 sm:p-4 rounded-2xl">
                    <Globe size={14} className="text-[#2563eb] sm:size-18" />
                    <span className="text-white font-bold text-sm sm:text-base">{user.country} {user.country_code && `(${user.country_code})`}</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Mot de passe</label>
                <button className="w-full py-3 sm:py-4 bg-[#2563eb]/10 hover:bg-[#2563eb] text-[#2563eb] hover:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all">
                  Modifier le mot de passe
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f1d] border border-[#2563eb10] p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
             <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <Bell className="text-[#2563eb]" size={16} />
              Notifications
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {[
                { label: "Nouveaux quiz disponibles", enabled: true },
                { label: "Rappels d'expiration de certification", enabled: true },
                { label: "Newsletter hebdomadaire", enabled: false }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-[#0f172a50] rounded-2xl border border-white/5">
                  <span className="text-xs sm:text-sm font-bold text-white">{item.label}</span>
                  <div className={cn(
                    "w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors cursor-pointer",
                    item.enabled ? "bg-[#2563eb]" : "bg-[#1e293b]"
                  )}>
                    <div className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 sm:top-1 transition-all",
                      item.enabled ? "right-0.5 sm:right-1" : "left-0.5 sm:left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
