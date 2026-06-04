import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../api/services';
import { Mail, Loader2, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const VerifyEmail: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.verifyEmail(email, code);
      
      if (response.access) {
        // Stocker les tokens dans le localStorage
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setSuccess(true);
        
        // Rediriger après un délai
        setTimeout(() => {
          const userRole = response.user.role;
          navigate('/app/login');
          
          // if (userRole === 'admin') {
          //   navigate('/admin/dashboard');
          // } else if (userRole === 'student') {
          //   navigate('/app/dashboard');
          // }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Code de vérification incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    
    try {
      await authService.register({
        email,
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: ''
      });
      setError('');
      alert('Un nouveau code de vérification a été envoyé');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-[#334155] shadow-2xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-4 sm:mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f8fafc] mb-2">Email vérifié !</h1>
            <p className="text-[#94a3b8] text-sm sm:text-base">Votre compte a été activé avec succès. Redirection en cours...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2563eb] text-white mx-auto flex items-center justify-center mb-3 sm:mb-4 shadow-xl">
            <Mail size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f8fafc] tracking-tight">Vérifier votre email</h1>
          <p className="text-[#94a3b8] mt-2 text-sm sm:text-base">
            Entrez le code de vérification envoyé à {email}
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
              <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-1.5 sm:mb-2 px-1">Code de vérification</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all text-center text-xl sm:text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
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
                  <span>Vérifier</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full bg-[#334155] hover:bg-[#475569] text-[#94a3b8] font-medium py-2.5 sm:py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              {resending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Renvoyer le code</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-[#64748b] text-xs sm:text-sm">
            Le code expire après 15 minutes
          </div>
        </div>
      </motion.div>
    </div>
  );
};
