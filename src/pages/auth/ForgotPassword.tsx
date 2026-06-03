import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/services';
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-[#334155] shadow-2xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-4 sm:mb-6">
              <Mail size={32} className="sm:size-40" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f8fafc] mb-2">Email envoyé !</h1>
            <p className="text-[#94a3b8] mb-4 sm:mb-6 text-sm sm:text-base">
              Un code de réinitialisation a été envoyé à votre email. Vérifiez votre boîte de réception.
            </p>
            <button
              onClick={() => navigate(`/app/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#2563eb]/20 text-sm sm:text-base"
            >
              <span>Entrer le code</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2563eb] text-white mx-auto flex items-center justify-center mb-3 sm:mb-4 shadow-xl">
            <Mail size={28} className="sm:size-32" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f8fafc] tracking-tight">Mot de passe oublié ?</h1>
          <p className="text-[#94a3b8] mt-2 text-sm sm:text-base">
            Entrez votre email pour recevoir un code de réinitialisation
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-1.5 sm:mb-2 px-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-[#2563eb] group-focus-within:text-[#2563eb] transition-colors">
                  <Mail size={16} className="sm:size-18" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#0f172a] border border-[#2563eb] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all placeholder-[#475569] text-sm sm:text-base"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#2563eb]/20 text-sm sm:text-base"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Envoyer le code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-[#94a3b8] text-sm sm:text-base">
            <Link
              to="/app/login"
              className="inline-flex items-center gap-2 text-[#2563eb] font-bold hover:underline"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
