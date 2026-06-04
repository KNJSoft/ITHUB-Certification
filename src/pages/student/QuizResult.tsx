import React from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Download, RefreshCw, Home, ExternalLink, Share2, Linkedin, MessageCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const QuizResult: React.FC = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  if (!state?.result) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
         <Link to="/app/dashboard" className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-bold">Retour au Dashboard</Link>
      </div>
    );
  }

  const { attempt, correct_answers, remaining_attempts, certification_obtained } = state.result;
  const { score, passed, quiz_title } = attempt;
  
  // Calculate percentage based on score
  const totalQuestions = Object.keys(correct_answers).length;
  const percentage = totalQuestions > 0 ? Math.round((score / 100) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 md:py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e293b] border border-[#334155] rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        <div className={cn(
          "p-8 sm:p-12 md:p-16 text-center border-b border-[#334155]",
          passed ? "bg-gradient-to-br from-[#2563eb]/20 to-transparent" : "bg-gradient-to-br from-red-500/10 to-transparent"
        )}>
          {passed && (
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#2563eb]" />
          )}
          
          <div className="flex justify-center mb-6 sm:mb-8 relative">
            {passed ? (
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#2563eb]/40"
              >
                <Award size={40} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[#0f172a] rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center border-4 border-red-500/30"
              >
                <XCircle size={40} className="text-red-500 " />
              </motion.div>
            )}
          </div>

          <h1 className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 tracking-tighter uppercase",
            passed ? "text-white" : "text-red-500"
          )}>
            {passed ? 'BravO ! Certifié' : 'Mission Échouée'}
          </h1>
          <p className="text-[#94a3b8] text-sm sm:text-base md:text-lg font-medium px-4 sm:px-6 md:px-8">
            {passed 
              ? 'Vous avez franchi les obstacles avec succès. Votre badge est prêt !' 
              : remaining_attempts === 0 
                ? 'Accès verrouillé. Vous avez épuisé toutes vos chances pour ce quiz.'
                : `Score insuffisant (${percentage}%). Il vous reste encore une chance !`}
          </p>
        </div>

        <div className="p-6 sm:p-8 md:p-12 space-y-6 sm:space-y-8 md:space-y-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-[#0f172a] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-[#334155] text-center">
              <span className="text-[#64748b] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] block mb-1.5 sm:mb-2">Résultat Final</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-white">{score} <span className="text-[#2563eb]">/</span> 100</span>
            </div>
            <div className="bg-[#0f172a] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-[#334155] text-center">
              <span className="text-[#64748b] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] block mb-1.5 sm:mb-2">Précision</span>
              <span className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-mono font-black",
                passed ? "text-[#2563eb]" : "text-red-500"
              )}>{percentage}%</span>
            </div>
          </div>

          {passed ? (
            <div className="space-y-4 sm:space-y-6">
              {/* <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button className="flex items-center justify-center gap-2 sm:gap-3 bg-[#0077b5] hover:bg-[#005c8d] text-white py-3 sm:py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </button>
                <button className="flex items-center justify-center gap-2 sm:gap-3 bg-[#25d366] hover:bg-[#128c7e] text-white py-3 sm:py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </button>
              </div> */}
              {/* <button
                onClick={() => alert('Badge téléchargé !')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white text-[#0f172a] py-3 sm:py-4 md:py-5 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <Download size={18}  strokeWidth={3} />
                <span>Récupérer mon Badge</span>
              </button> */}
              <button 
                onClick={() => navigate('/app/certifications')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 text-[#94a3b8] hover:text-[#f8fafc] font-bold text-xs sm:text-sm transition-colors py-2"
              >
                <Award size={14} />
                <span>Voir toutes mes certifications</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {remaining_attempts > 0 ? (
                <button
                  onClick={() => navigate(`/app/quiz/${id}`)}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 sm:py-4 md:py-5 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all transform hover:scale-[1.02] shadow-xl shadow-[#2563eb]/20"
                >
                  <RefreshCw size={18} />
                  <span>Réessayer maintenant</span>
                </button>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center">
                   <AlertCircle size={24} className="text-red-500 mx-auto mb-2 sm:mb-3" />
                   <h3 className="text-red-500 font-black uppercase tracking-widest text-[10px] sm:text-xs sm:text-sm">Quiz verrouillé définitivement</h3>
                   <p className="text-[#94a3b8] text-[10px] sm:text-xs mt-1 sm:mt-2 leading-relaxed">Vous avez atteint la limite maximale d'essais autorisés.</p>
                </div>
              )}
              <button
                onClick={() => navigate('/app/dashboard')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#1e293b] border border-[#334155] text-[#94a3b8] py-3 sm:py-4 md:py-5 rounded-2xl sm:rounded-3xl font-bold hover:text-white transition-colors text-xs sm:text-sm"
              >
                <Home size={18} />
                <span>Retour au Menu Principal</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
