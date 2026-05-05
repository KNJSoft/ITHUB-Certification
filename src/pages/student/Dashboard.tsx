import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../api/services';
import { Quiz } from '../../api/mockData';
import { Clock, Play, BookOpen, Star, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Dashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Quizz Disponibles</h1>
        <p className="text-[#94a3b8] text-lg font-medium">Développez vos compétences et validez vos acquis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quizzes.map((quiz, index) => {
          const expired = isExpired(quiz.expiresAt);
          const canStart = !expired && quiz.attemptsRemaining > 0;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative bg-[#1e293b] border rounded-[2.5rem] p-8 flex flex-col transition-all duration-300",
                expired ? "opacity-60 border-[#334155]" : "border-[#334155] hover:border-[#2563eb]/50 hover:shadow-2xl hover:shadow-[#2563eb]/10"
              )}
            >
              {/* Badges Overlay */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="bg-[#2563eb]/10 text-[#2563eb] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#2563eb]/20">
                  {quiz.category}
                </div>
                {quiz.isCertified && (
                  <div className="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Certifié ✓
                  </div>
                )}
                {expired && (
                  <div className="bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-1">
                    <AlertCircle size={10} /> Expiré
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black mb-3 group-hover:text-[#2563eb] transition-colors">{quiz.title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed mb-8 line-clamp-2">{quiz.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-[#334155]/50">
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest mb-1">Questions</p>
                  <div className="flex items-center gap-2 font-bold text-[#f8fafc]">
                    <BookOpen size={14} className="text-[#2563eb]" />
                    <span>{quiz.questions.length}</span>
                  </div>
                </div>
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-[#334155]/50">
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest mb-1">Essais</p>
                  <div className="flex items-center gap-2 font-bold text-[#f8fafc]">
                    <Star size={14} className="text-amber-500" />
                    <span>{quiz.attemptsRemaining} / {quiz.attemptsAllowed}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-2 text-xs text-[#94a3b8] font-medium">
                   <Calendar size={14} />
                   <span>Expire le {quiz.expiresAt || 'N/A'}</span>
                </div>
              </div>

              <button
                disabled={!canStart}
                onClick={() => navigate(`/app/quiz/${quiz.id}`)}
                className={cn(
                  "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-95",
                  canStart 
                    ? "bg-[#2563eb] text-white shadow-xl shadow-[#2563eb]/20 hover:bg-[#1d4ed8] hover:-translate-y-1" 
                    : "bg-[#334155] text-[#94a3b8] cursor-not-allowed"
                )}
              >
                {expired ? "ACCÈS FERMÉ" : quiz.attemptsRemaining === 0 ? "PLU D'ESSAIS" : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Lancer le Quiz</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
