import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../api/services';
import { Quiz } from '../../api/types';
import { Play, BookOpen, Star, AlertCircle, CheckCircle2, Calendar, Award, TrendingUp, Clock, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Dashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getQuizzes();
        setQuizzes(data);
        console.log(data)
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des quiz');
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  // Calculer les statistiques
  const totalQuizzes = Array.isArray(quizzes['results']) ? quizzes['results'].length : 0;
  const availableQuizzes = Array.isArray(quizzes['results']) ? quizzes['results'].filter(q => q.is_active && !isExpired(q.expiration_date)).length : 0;
  const totalAttempts = Array.isArray(quizzes['results']) ? quizzes['results'].reduce((sum, q) => sum + (q.attempts_count || 0), 0) : 0;

  const stats = [
    {
      label: 'Quiz Disponibles',
      value: availableQuizzes,
      icon: BookOpen,
      color: 'from-[#2563eb] to-[#60a5fa]',
      bgColor: 'bg-[#2563eb]/10',
      borderColor: 'border-[#2563eb]/20'
    },
    {
      label: 'Quiz Complétés',
      value: totalAttempts,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Certifications',
      value: 0,
      icon: Award,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      label: 'Score Moyen',
      value: '0%',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">Tableau de Bord</h1>
        <p className="text-[#94a3b8] text-sm sm:text-base md:text-lg font-medium">Bienvenue sur votre espace d'apprentissage.</p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1e293b] border border-[#334155] rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 hover:border-[#334155]/50 transition-all"
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4", stat.bgColor, stat.borderColor, "border")}>
              <stat.icon size={20} className={cn("text-white sm:size-24")} />
            </div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748b] tracking-widest mb-1.5 sm:mb-2">{stat.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Quiz Disponibles */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Quiz Disponibles</h2>
          <button className="text-[10px] font-black text-[#2563eb] uppercase tracking-widest hover:underline px-3 sm:px-4 py-2 bg-[#2563eb]/10 rounded-full">
            Voir tout
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="text-center">
              <BookOpen size={40} className="text-[#64748b] mx-auto mb-4 sm:size-48" />
              <p className="text-[#94a3b8] text-sm sm:text-base md:text-lg">Aucun quiz disponible pour le moment</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(quizzes['results']) && quizzes['results'].slice(0, 6).map((quiz, index) => {
              const expired = !quiz.is_active || isExpired(quiz.expiration_date);
              const attemptsRemaining = quiz.max_attempts - (quiz.attempts_count || 0);
              const canStart = !expired && attemptsRemaining > 0;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative bg-[#1e293b] border rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex flex-col transition-all duration-300",
                    expired ? "opacity-60 border-[#334155]" : "border-[#334155] hover:border-[#2563eb]/50 hover:shadow-2xl hover:shadow-[#2563eb]/10"
                  )}
                >
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    <div className="bg-[#2563eb]/10 text-[#2563eb] px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-[#2563eb]/20">
                      {quiz.category}
                    </div>
                    <div className="bg-purple-500/10 text-purple-500 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                      {quiz.difficulty}
                    </div>
                    {expired && (
                      <div className="bg-red-500/10 text-red-500 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-1">
                        <AlertCircle size={6} className="sm:size-8" /> Expiré
                      </div>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black mb-2 group-hover:text-[#2563eb] transition-colors">{quiz.title}</h3>
                  <p className="text-[#94a3b8] text-[11px] sm:text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-2">{quiz.description}</p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-1">
                    <div className="bg-[#0f172a] rounded-xl p-2 sm:p-3 border border-[#334155]/50">
                      <p className="text-[8px] sm:text-[9px] uppercase font-bold text-[#64748b] tracking-widest mb-1">Questions</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#f8fafc] text-xs sm:text-sm">
                        <BookOpen size={10} className="text-[#2563eb] sm:size-12" />
                        <span>{quiz?.questions.length || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-[#0f172a] rounded-xl p-2 sm:p-3 border border-[#334155]/50">
                      <p className="text-[8px] sm:text-[9px] uppercase font-bold text-[#64748b] tracking-widest mb-1">Essais</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#f8fafc] text-xs sm:text-sm">
                        <Star size={10} className="text-amber-500 sm:size-12" />
                        <span>{attemptsRemaining} / {quiz.max_attempts}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!canStart}
                    onClick={() => navigate(`/app/quiz/${quiz.id}`)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all transform active:scale-95",
                      canStart 
                        ? "bg-[#2563eb] text-white shadow-xl shadow-[#2563eb]/20 hover:bg-[#1d4ed8] hover:-translate-y-1" 
                        : "bg-[#334155] text-[#94a3b8] cursor-not-allowed"
                    )}
                  >
                    {expired ? "ACCÈS FERMÉ" : attemptsRemaining === 0 ? "PLUS D'ESSAIS" : (
                      <>
                        <Play size={14} className="sm:size-16" fill="currentColor" />
                        <span>Lancer</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
