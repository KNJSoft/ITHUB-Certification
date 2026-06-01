import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../api/services';
import { Lock, Loader2, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useRateLimit } from '../../hooks/useRateLimit';

export const ResetPassword: React.FC = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const navigate = useNavigate();
  const rateLimit = useRateLimit('reset_password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    try {
      await authService.resetPassword(email, code, newPassword);
      
      // Enregistrer la tentative réussie
      rateLimit.recordAttempt(true);
      
      setSuccess(true);
      
      // Rediriger après un délai
      setTimeout(() => {
        navigate('/app/login');
      }, 2000);
    } catch (err: any) {
      // Enregistrer la tentative échouée
      rateLimit.recordAttempt(false);
      
      if (err.message.includes('Trop de requêtes')) {
        setError('Trop de tentatives. Veuillez attendre quelques instants.');
      } else {
        setError(err.message || 'Erreur lors de la réinitialisation');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-6">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-[#f8fafc] mb-2">Mot de passe réinitialisé !</h1>
            <p className="text-[#94a3b8]">Votre mot de passe a été modifié avec succès. Redirection en cours...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#2563eb] text-white mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#f8fafc] tracking-tight">Réinitialiser le mot de passe</h1>
          <p className="text-[#94a3b8] mt-2">
            Entrez le code de vérification et votre nouveau mot de passe
          </p>
        </div>

        <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {rateLimit.isBlocked && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Trop de tentatives. Réessayez dans {rateLimit.getTimeRemaining()} secondes.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2 px-1">Code de vérification</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full px-4 py-3 bg-[#0f172a] border border-[#2563eb] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2 px-1">Nouveau mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2563eb] group-focus-within:text-[#2563eb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#2563eb] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all placeholder-[#475569]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2 px-1">Confirmer le mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2563eb] group-focus-within:text-[#2563eb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#2563eb] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all placeholder-[#475569]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || rateLimit.isBlocked}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#2563eb]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Réinitialiser</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[#64748b] text-sm">
            Le code expire après 15 minutes
          </div>

          <div className="mt-8 text-center text-[#94a3b8]">
            <Link 
              to="/app/login" 
              className="inline-flex items-center gap-2 text-[#2563eb] font-bold hover:underline"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
