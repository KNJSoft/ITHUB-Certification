import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services';
import { Lock, Mail, Loader2, Code2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LoginProps {
  isAdmin?: boolean;
}

export const Login: React.FC<LoginProps> = ({ isAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login(email, password);
      login(response.user as any, response.token);
      
      // Rediriger selon le rôle de l'utilisateur
      const userRole = response.user.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'student') {
        navigate('/app/dashboard');
      } else {
        setError('Rôle utilisateur non reconnu');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className={cn(
            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl",
            isAdmin ? "bg-white text-[#2563eb]" : "bg-[#2563eb] text-white"
          )}>
            {isAdmin ? <ShieldCheck size={32} /> : <Code2 size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-[#f8fafc] tracking-tight">
            {isAdmin ? 'Admin Portal' : 'Student Portal'}
          </h1>
          <p className="text-[#94a3b8] mt-2">
            Welcome back to IT HUB Certification
          </p>
        </div>

        <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2 px-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all placeholder-[#475569]"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2 px-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all placeholder-[#475569]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#2563eb]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-8 text-center text-[#94a3b8]">
                Don't have an account?{' '}
                <Link to="/app/register" className="text-[#2563eb] font-bold hover:underline">
                  Sign up now
                </Link>
            </div>
          )}
          
          <div className="mt-8 pt-8 border-t border-[#334155]">
            {/*
            <Link 
              to={isAdmin ? "/app/login" : "/admin/login"} 
              className="block w-full text-center text-xs uppercase tracking-widest font-bold text-[#64748b] hover:text-[#2563eb] transition-colors"
            >
              Switch to {isAdmin ? 'Student' : 'Admin'} portal
            </Link>
           */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
