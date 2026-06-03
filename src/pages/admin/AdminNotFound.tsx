import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7c3aed]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7c3aed]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="w-32 h-32 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] mx-auto flex items-center justify-center mb-8">
          <AlertCircle size={64} />
        </div>

        <h1 className="text-8xl font-black text-[#f8fafc] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#f8fafc] mb-4">Page non trouvée</h2>
        <p className="text-[#94a3b8] mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>

          <Link
            to="/admin/dashboard"
            className="px-6 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#7c3aed]/20"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Admin</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
