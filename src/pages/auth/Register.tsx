import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/services';
import { User, Mail, Lock, Loader2, Code2, ArrowRight, Phone, Globe, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useRateLimit } from '../../hooks/useRateLimit';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const rateLimit = useRateLimit('register');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.register({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
        phone_number: phoneNumber || undefined,
        country: country || undefined,
        country_code: countryCode || undefined
      });
      
      // Enregistrer la tentative réussie
      rateLimit.recordAttempt(true);
      
      // Rediriger vers la page de vérification d'email
      navigate(`/app/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      // Enregistrer la tentative échouée
      rateLimit.recordAttempt(false);
      
      if (err.message.includes('Trop de requêtes')) {
        setError('Trop de tentatives. Veuillez attendre quelques instants.');
      } else {
        setError(err.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#2563eb] text-white mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Code2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#f8fafc] tracking-tight">Create Account</h1>
          <p className="text-[#94a3b8] mt-2">Join IT HUB and grow your skills</p>
        </div>

        <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Prénom</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                    placeholder="Jean"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Nom</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                  placeholder="jean@example.com"
                  required
                />
              </div>
            </div>
            {/*
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Numéro de téléphone (optionnel)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
             */}
            {/* 
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Pays (optionnel)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                    <Globe size={18} />
                  </div>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                    placeholder="France"
                  />
                </div>
              </div>
              */}
              {/* 
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Code pays (optionnel)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                    <Globe size={18} />
                  </div>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                    placeholder="FR"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
                */}
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5 px-1">Confirmer le mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b] group-focus-within:text-[#2563eb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || rateLimit.isBlocked}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#2563eb]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[#94a3b8]">
            Already have an account?{' '}
            <Link to="/app/login" className="text-[#2563eb] font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
