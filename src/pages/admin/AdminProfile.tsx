import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Award, Phone, Globe, Edit, Save, X, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import { authService } from '../../api/services';

export const AdminProfile: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // État du formulaire de profil
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    country: user?.country || '',
    country_code: user?.country_code || '',
  });

  // État du formulaire de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}` : '';

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile(profileForm);
      updateUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordForm);
      setSuccess('Mot de passe changé avec succès');
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-2">Mon Profil Admin</h1>
        <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium tracking-wide">Gérez vos informations personnelles et vos préférences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0f1d] border border-[#7c3aed10] p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
            <div className="relative group mb-4 sm:mb-6">
              {user?.profile_image_url ? (
                <img 
                  src={user.profile_image_url} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] object-cover shadow-xl shadow-[#7c3aed]/20 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center font-black text-white text-3xl sm:text-4xl md:text-5xl shadow-xl shadow-[#7c3aed]/20 group-hover:scale-105 transition-transform">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 sm:p-3 bg-white text-[#7c3aed] rounded-xl shadow-lg hover:scale-110 transition-all">
                <Camera size={14}/>
              </button>
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{fullName}</h3>
            <p className="text-[9px] sm:text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.2em] mt-1">Administrateur</p>
            
            <div className="w-full mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#7c3aed05] space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm tracking-tight">
                <span className="text-[#64748b] font-bold">Inscrit le:</span>
                <span className="text-white font-black">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          <div className="bg-[#0a0f1d] border border-[#7c3aed10] p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                <Shield className="text-[#7c3aed]" size={16} />
                Informations du compte
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#7c3aed]/10 hover:bg-[#7c3aed] text-[#7c3aed] hover:text-white rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all"
                >
                  <Edit size={12} />
                  Modifier
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Prénom</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <User size={14} className="text-[#7c3aed]" />
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Nom</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <User size={14} className="text-[#7c3aed]" />
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Phone size={14} className="text-[#7c3aed]" />
                    <input
                      type="text"
                      value={profileForm.phone_number}
                      onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Pays</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Globe size={14} className="text-[#7c3aed]" />
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-3 sm:gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 sm:py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Enregistrement...' : <><Save size={14} /> Enregistrer</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 sm:py-4 bg-[#1e293b] hover:bg-[#334155] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={14} />
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Prénom</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <User size={14} className="text-[#7c3aed]" />
                    <span className="text-white font-bold text-sm sm:text-base">{user?.first_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Nom</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <User size={14} className="text-[#7c3aed]" />
                    <span className="text-white font-bold text-sm sm:text-base">{user?.last_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Email</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Mail size={14} className="text-[#7c3aed]" />
                    <span className="text-white font-bold text-sm sm:text-base">{user?.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Rôle</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Award size={14} className="text-[#7c3aed]" />
                    <span className="text-white font-bold capitalize text-sm sm:text-base">{user?.role || 'N/A'}</span>
                  </div>
                </div>
                {user?.phone_number && (
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Téléphone</label>
                    <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                      <Phone size={14} className="text-[#7c3aed]" />
                      <span className="text-white font-bold text-sm sm:text-base">{user.phone_number}</span>
                    </div>
                  </div>
                )}
                {user?.country && (
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Pays</label>
                    <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                      <Globe size={14} className="text-[#7c3aed]" />
                      <span className="text-white font-bold text-sm sm:text-base">{user.country} {user.country_code && `(${user.country_code})`}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Mot de passe</label>
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full py-3 sm:py-4 bg-[#7c3aed]/10 hover:bg-[#7c3aed] text-[#7c3aed] hover:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={14} />
                    Modifier le mot de passe
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de changement de mot de passe */}
          {isChangingPassword && (
            <div className="bg-[#0a0f1d] border border-[#7c3aed10] p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                  <Lock className="text-[#7c3aed]" size={16} />
                  Changer le mot de passe
                </h2>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="p-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl transition-all"
                >
                  <X size={14} />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Mot de passe actuel</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Lock size={14} className="text-[#7c3aed]" />
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Lock size={14} className="text-[#7c3aed]" />
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Confirmer le nouveau mot de passe</label>
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#0f172a] border border-[#7c3aed10] p-3 sm:p-4 rounded-2xl">
                    <Lock size={14} className="text-[#7c3aed]" />
                    <input
                      type="password"
                      value={passwordForm.new_password_confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
                      className="bg-transparent text-white font-bold text-sm sm:text-base w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 sm:py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Changement...' : <><Save size={14} /> Changer le mot de passe</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 sm:py-4 bg-[#1e293b] hover:bg-[#334155] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={14} />
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
