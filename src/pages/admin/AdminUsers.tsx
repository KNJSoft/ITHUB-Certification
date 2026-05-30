import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import { UserListItem } from '../../api/types';
import { Search, User, Mail, Calendar, Award, ExternalLink, Activity, Filter, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
        console.log(data)
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers =Array.isArray(users['results']) && users['results'].filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log('filteredUsers:',filteredUsers)
  if (loading) return (
     <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#7c3aed]/10 rounded-lg"><User className="text-[#7c3aed]" size={28} /></div>
             <h1 className="text-4xl font-black tracking-tight text-white uppercase">Utilisateurs</h1>
          </div>
          <p className="text-[#64748b] font-medium tracking-wide mt-2">Registre complet des étudiants et de leurs certifications.</p>
        </div>
      </header>

      <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#7c3aed10] flex flex-col md:flex-row justify-between gap-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#475569]" size={20} />
            <input 
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 transition-all font-medium placeholder:text-[#475569]"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-[#0f172a] border border-[#7c3aed10] px-5 py-3 rounded-2xl text-[10px] font-black text-[#64748b] uppercase tracking-widest">
                <Filter size={14} className="text-[#7c3aed]" />
                Filtrer par score
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1d] text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">
                <th className="px-10 py-6 border-b border-[#7c3aed10]">Utilisateur</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10]">Email</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Certifications</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Dernière Activité</th>
                <th className="px-10 py-6 border-b border-[#7c3aed10] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7c3aed05]">
              {Array.isArray(filteredUsers) && filteredUsers.map((u, idx) => (
                <tr key={u.id} className="group hover:bg-[#7c3aed05]/40 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[1.25rem] flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                        {u.first_name?.charAt(0) || u.email.charAt(0)}
                      </div>
                      <p className="font-black text-white group-hover:text-[#7c3aed] transition-colors">{u.first_name} {u.last_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-[#94a3b8] font-medium text-sm">
                    {u.email}
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="bg-[#7c3aed10] text-[#7c3aed] text-[10px] font-black px-3 py-1 rounded-full border border-[#7c3aed15]">
                          {u.certifications_count || 0}
                       </span>
                       <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest">Certifications</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Activity size={14} className="text-[#64748b]" />
                      <span className="text-[11px] font-bold text-[#94a3b8]">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0f1d] hover:bg-[#7c3aed] text-[#7c3aed] hover:text-white border border-[#7c3aed10] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">
                      <Eye size={14} />
                      <span>Voir badges</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-[#0f172a30] flex items-center justify-between">
           <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">{filteredUsers.length} étudiants trouvés</p>
           <div className="flex gap-2">
              <button disabled className="px-5 py-2.5 bg-[#0a0f1d] border border-[#7c3aed10] text-[#475569] rounded-xl text-[10px] font-black uppercase tracking-widest opacity-50">Précédent</button>
              <button className="px-5 py-2.5 bg-[#0a0f1d] border border-[#7c3aed10] text-[#f8fafc] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#7c3aed]">Suivant</button>
           </div>
        </div>
      </div>
    </div>
  );
};
