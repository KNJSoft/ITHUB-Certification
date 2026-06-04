import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, Lock, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
           <div className="p-2 bg-[#7c3aed]/10 rounded-lg"><SettingsIcon className="text-[#7c3aed]" size={20} /></div>
           <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Paramètres</h1>
        </div>
        <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium tracking-wide">Configurez les options globales de la plateforme.</p>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest w-fit">
          Mode statique - Pas d'endpoint API disponible
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* <div className="md:col-span-1 space-y-2">
          {[
            { label: 'Général', icon: Globe, active: true },
            { label: 'Sécurité', icon: Lock },
            { label: 'Notifications', icon: Bell },
            { label: 'Base de données', icon: Database },
            { label: 'API & Webhooks', icon: Zap },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                item.active 
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20" 
                  : "text-[#64748b] hover:bg-[#7c3aed10] hover:text-[#7c3aed]"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div> */}

        <div className="md:col-span-3 space-y-6 sm:space-y-8">
          <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-6 sm:mb-8 md:mb-10 pb-4 border-b border-[#7c3aed10]">Platform Configuration</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase mb-1">Nom de la plateforme</h3>
                  <p className="text-[10px] sm:text-xs text-[#64748b] font-medium">S'affiche dans les emails et le header.</p>
                </div>
                <input 
                  type="text" 
                  defaultValue="IT HUB Certification"
                  className="w-full sm:w-64 bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase mb-1">Email de support</h3>
                  <p className="text-[10px] sm:text-xs text-[#64748b] font-medium">Utilisé pour les notifications automatiques.</p>
                </div>
                <input 
                  type="email" 
                  defaultValue="support@ithub.bj"
                  className="w-full sm:w-64 bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase mb-1">Seuil de réussite (%)</h3>
                  <p className="text-[10px] sm:text-xs text-[#64748b] font-medium">Score minimum pour obtenir un badge.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <input 
                    type="number" 
                    defaultValue="80"
                    className="w-20 sm:w-24 bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-center text-sm sm:text-base"
                  />
                  <span className="text-white font-black text-sm sm:text-base">%</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase mb-1">Tentatives par défaut</h3>
                  <p className="text-[10px] sm:text-xs text-[#64748b] font-medium">Nombre d'essais autorisé par quiz.</p>
                </div>
                <input 
                  type="number" 
                  defaultValue="2"
                  className="w-20 sm:w-24 bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-center text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 flex justify-end">
              <button className="bg-[#7c3aed] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-[#6d28d9] transition-all shadow-xl shadow-[#7c3aed]/20">
                Enregistrer les modifications
              </button>
            </div>
          </div>

          {/* <div className="bg-red-500/5 border border-red-500/10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10">
             <h2 className="text-xs sm:text-sm font-black text-red-500 uppercase tracking-widest mb-4 sm:mb-6">Zone de danger</h2>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[10px] sm:text-xs font-black text-white uppercase mb-1">Réinitialiser toutes les statistiques</h3>
                  <p className="text-[9px] sm:text-[10px] text-[#64748b] font-medium">Cette action supprimera tous les logs de tentatives.</p>
                </div>
                <button className="px-4 sm:px-6 py-2 sm:py-3 border border-red-500/20 text-red-500 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                  Réinitialiser
                </button>
             </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
