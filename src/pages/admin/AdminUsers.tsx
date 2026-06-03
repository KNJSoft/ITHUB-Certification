import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import { UserListItem } from '../../api/types';
import { Search, User, Mail, Calendar, Award, ExternalLink, Activity, Filter, Eye, Edit2, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    page: 1
  });
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    country: '',
    country_code: '',
    password: '',
    password_confirm: '',
    role: 'student',
    is_verified: false,
    is_active: true
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers(1, 10);
        setUsers(data.results || data);
        setPagination({
          count: data.count || 0,
          next: data.next || null,
          previous: data.previous || null,
          page: 1
        });
        console.log(data)
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(newPage, 10);
      setUsers(data.results || data);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page: newPage
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (newUser.password !== newUser.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const result=await adminService.createUser(newUser);
      console.log(result);
      setIsModalOpen(false);
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        country: '',
        country_code: '',
        password: '',
        password_confirm: '',
        role: 'student',
        is_verified: false,
        is_active: true
      });
      // Recharger la liste des utilisateurs
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      // Créer un objet avec seulement les champs nécessaires pour la mise à jour
      const updateData: any = {
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        country: newUser.country,
        country_code: newUser.country_code,
        role: newUser.role,
        is_verified: newUser.is_verified,
        is_active: newUser.is_active
      };

      // N'inclure le mot de passe que s'il est fourni
      if (newUser.password && newUser.password.trim() !== '') {
        updateData.password = newUser.password;
        updateData.password_confirm = newUser.password_confirm;
      }

      const result = await adminService.updateUser(editingUser.id, updateData);
      console.log(result);
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        country: '',
        country_code: '',
        password: '',
        password_confirm: '',
        role: 'student',
        is_verified: false,
        is_active: true
      });
      // Recharger la liste des utilisateurs avec la pagination actuelle
      const data = await adminService.getUsers(pagination.page, 10);
      setUsers(data.results || data);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page: pagination.page
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    setLoading(true);
    try {
      await adminService.deleteUser(userId);
      // Recharger la page actuelle avec pagination
      const data = await adminService.getUsers(pagination.page, 10);
      setUsers(data.results || data);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page: pagination.page
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || '',
      country: user.country || '',
      country_code: user.country_code || '',
      password: '',
      password_confirm: '',
      role: user.role || 'student',
      is_verified: user.is_verified || false,
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setIsModalOpen(true);
  };

  const filteredUsers =Array.isArray(users) && users.filter(u => 
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
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="p-2 bg-[#7c3aed]/10 rounded-lg"><User className="text-[#7c3aed]" size={20} /></div>
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Utilisateurs</h1>
          </div>
          <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium tracking-wide mt-1 sm:mt-2">Registre complet des étudiants et de leurs certifications.</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setNewUser({
              email: '',
              first_name: '',
              last_name: '',
              phone_number: '',
              country: '',
              country_code: '',
              password: '',
              password_confirm: '',
              role: 'student',
              is_verified: false,
              is_active: true
            });
            setIsModalOpen(true);
          }}
          className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#7c3aed] text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-[#7c3aed]/20 hover:bg-[#6d28d9] transition-all active:scale-95"
        >
          + Ajouter un utilisateur
        </button>
      </header>

      <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 md:p-8 border-b border-[#7c3aed10] flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
            <input 
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 transition-all font-medium placeholder:text-[#475569] text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="flex items-center gap-2 bg-[#0f172a] border border-[#7c3aed10] px-3 sm:px-5 py-2 sm:py-3 rounded-2xl text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest">
                <Filter size={12} className="text-[#7c3aed] sm:size-14" />
                Filtrer par score
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1d] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">
                <th className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-[#7c3aed10]">Utilisateur</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] hidden sm:table-cell">Email</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center">Certifications</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden md:table-cell">Dernière Activité</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden sm:table-cell">Rôle</th>
                <th className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-[#7c3aed10] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7c3aed05]">
              {Array.isArray(filteredUsers) && filteredUsers.map((u, idx) => (
                <tr key={u.id} className="group hover:bg-[#7c3aed05]/40 transition-all">
                  <td className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[1.25rem] flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform text-xs sm:text-sm">
                        {u.first_name?.charAt(0) || u.email.charAt(0)}
                      </div>
                      <p className="font-black text-white group-hover:text-[#7c3aed] transition-colors text-xs sm:text-sm md:text-base">{u.first_name} {u.last_name}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-[#94a3b8] font-medium text-xs sm:text-sm hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center">
                    <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                       <span className="bg-[#7c3aed10] text-[#7c3aed] text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full border border-[#7c3aed15]">
                          {u.certifications_count || 0}
                       </span>
                       <span className="text-[8px] sm:text-[9px] text-[#64748b] font-bold uppercase tracking-widest hidden sm:block">Certifications</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden md:table-cell">
                    <div className="flex flex-col items-center gap-1">
                      <Activity size={12} className="text-[#64748b] sm:size-14" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8]">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden sm:table-cell">
                    <div className="flex flex-col items-center gap-1">
                      <Award size={12} className="text-[#64748b] sm:size-14" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8]">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 text-right">
                    <div className="flex justify-end gap-2 sm:gap-3">
                      <button 
                        onClick={() => handleEditUser(u)}
                        className="p-2 sm:p-3 bg-[#0a0f1d] hover:bg-[#7c3aed] text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm"
                      >
                        <Edit2 size={14} className="sm:size-18" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 sm:p-3 bg-[#0a0f1d] hover:bg-red-500 text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm"
                      >
                        <Trash size={14} className="sm:size-18" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8 bg-[#0f172a30] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <p className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">{pagination.count} utilisateurs trouvés</p>
           <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.previous}
                className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-[#0a0f1d] border border-[#7c3aed10] text-[#f8fafc] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2"
              >
                <ChevronLeft size={12} className="sm:size-14" />
                <span className="hidden sm:inline">Précédent</span>
              </button>
              <span className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest px-2 sm:px-3">
                Page {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.next}
                className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-[#0a0f1d] border border-[#7c3aed10] text-[#f8fafc] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2"
              >
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight size={12} className="sm:size-14" />
              </button>
           </div>
        </div>
      </div>

      {/* Modal Créer/Modifier Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0a0f1d] border border-[#7c3aed30] w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8 md:p-10 border-b border-[#7c3aed10] flex justify-between items-center bg-gradient-to-r from-[#7c3aed05] to-transparent">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {editingUser ? 'Modifier l\'Utilisateur' : 'Créer un Nouvel Utilisateur'}
                </h2>
                <p className="text-[10px] sm:text-xs text-[#64748b] font-medium mt-1 uppercase tracking-widest">
                  {editingUser ? 'Mettez à jour les informations de l\'utilisateur' : 'Configurez le compte étudiant'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7c3aed10] text-[#7c3aed] flex items-center justify-center hover:bg-[#7c3aed] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Prénom</label>
                  <input 
                    type="text" 
                    placeholder="John"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Nom</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  placeholder="john.doe@example.com"
                  className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Téléphone</label>
                  <input 
                    type="text" 
                    placeholder="+1234567890"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Pays</label>
                  <input 
                    type="text" 
                    placeholder="France"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newUser.country}
                    onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Rôle</label>
                <select 
                  className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 appearance-none text-sm sm:text-base"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="student">Étudiant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl">
                    <input
                      type="checkbox"
                      id="is_verified"
                      checked={newUser.is_verified}
                      onChange={(e) => setNewUser({...newUser, is_verified: e.target.checked})}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#7c3aed10] text-[#7c3aed] focus:ring-[#7c3aed]/40"
                    />
                    <label htmlFor="is_verified" className="text-xs sm:text-sm font-bold text-[#f8fafc]">
                      Email vérifié
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={newUser.is_active}
                      onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#7c3aed10] text-[#7c3aed] focus:ring-[#7c3aed]/40"
                    />
                    <label htmlFor="is_active" className="text-xs sm:text-sm font-bold text-[#f8fafc]">
                      Compte actif
                    </label>
                  </div>
                </div>
              )}

              {!editingUser && (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Mot de passe</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                      value={newUser.password_confirm}
                      onChange={(e) => setNewUser({...newUser, password_confirm: e.target.value})}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 sm:py-4 md:py-5 bg-[#0f172a] border border-[#7c3aed10] text-[#64748b] rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:border-[#7c3aed] transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={loading}
                  className="flex-[2] py-3 sm:py-4 md:py-5 bg-[#7c3aed] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-[#7c3aed]/20 hover:bg-[#6d28d9] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Traitement...' : (editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
