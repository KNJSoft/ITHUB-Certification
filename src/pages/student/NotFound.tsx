import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563eb]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#2563eb]/20 text-[#2563eb] mx-auto flex items-center justify-center mb-6 sm:mb-8">
          <AlertCircle size={48} className="sm:size-64" />
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#f8fafc] mb-3 sm:mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc] mb-3 sm:mb-4">Page non trouvée</h2>
        <p className="text-[#94a3b8] text-sm sm:text-base mb-6 sm:mb-8 px-4">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={14} className="sm:size-18" />
            <span>Retour</span>
          </button>

          <Link
            to="/app/dashboard"
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#2563eb]/20 text-sm sm:text-base"
          >
            <Home size={14} className="sm:size-18" />
            <span>Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
