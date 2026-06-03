import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../api/services';
import { QuizDetail } from '../../api/types';
import { ChevronRight, ChevronLeft, Flag, Timer, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const QuizPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizService.getQuizById(id!);
        setQuiz(data);
        console.log(data)
        setTimeLeft(data.timer_minutes * 60);
        setHasStarted(true);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération du quiz');
        setTimeout(() => navigate('/app/dashboard'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (!hasStarted || timeLeft <= 0) {
      if (hasStarted && timeLeft <= 0) {
        handleSubmit();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, hasStarted]);

  const handleSelect = (optionId: string) => {
    const currentQuestion = quiz?.questions[currentIdx];
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionId
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await quizService.submitQuiz(id!, answers);
      navigate(`/app/quiz/${id}/result`, { 
        state: { 
          result,
          quizId: id
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission du quiz');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !quiz) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl">
        {error || 'Quiz non trouvé'}
      </div>
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentIdx];
  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;
  const isAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      {/* Sticky Quiz Header */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 sm:top-24 z-30 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2563eb] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-[#2563eb]/20 text-sm sm:text-base">
            {currentIdx + 1}
          </div>
          <div>
            <h1 className="font-bold text-[#f8fafc] leading-tight text-sm sm:text-base">{quiz.title}</h1>
            <p className="text-[9px] sm:text-[10px] text-[#94a3b8] uppercase tracking-widest font-black">Question en cours</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border font-mono font-black text-base sm:text-lg min-w-[100px] sm:min-w-[120px] justify-center transition-all",
          timeLeft < 60 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse scale-105" : "bg-[#0f172a] border-[#334155] text-[#2563eb]"
        )}>
          <Timer size={16} className="sm:size-20" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="h-1 sm:h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-6 sm:mb-8 border border-[#334155]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa]" 
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1e293b] border border-[#334155] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 flex-1 flex flex-col shadow-xl"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-10">
             <div className="mt-1 sm:mt-1.5"><Info size={16} className="text-[#2563eb] sm:size-20" /></div>
             <h2 className="text-lg sm:text-xl md:text-2xl font-black leading-snug text-[#f8fafc]">{currentQuestion.text}</h2>
          </div>
          
          <div className="space-y-3 sm:space-y-4 flex-1">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "w-full text-left p-4 sm:p-6 rounded-2xl border transition-all duration-200 group flex items-center gap-3 sm:gap-4 relative overflow-hidden",
                  answers[currentQuestion.id] === option.id 
                    ? "bg-[#2563eb]/20 border-[#2563eb] ring-2 ring-[#2563eb]/10" 
                    : "bg-[#0f172a] border-[#334155] hover:border-[#475569] hover:bg-[#1e293b]"
                )}
              >
                <div className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all",
                  answers[currentQuestion.id] === option.id ? "bg-[#2563eb] border-[#2563eb] rotate-0" : "border-[#334155] group-hover:border-[#475569] rotate-45"
                )}>
                  {answers[currentQuestion.id] === option.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={cn(
                  "font-bold text-sm sm:text-base md:text-lg",
                  answers[currentQuestion.id] === option.id ? "text-white" : "text-[#94a3b8] group-hover:text-[#cbd5e1]"
                )}>{option.text}</span>
                
                {answers[currentQuestion.id] === option.id && (
                   <motion.div layoutId="selection-bg" className="absolute left-0 bottom-0 top-0 w-1 bg-[#2563eb]" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(prev => prev - 1)}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest text-[#94a3b8] bg-[#1e293b] border border-[#334155] hover:text-[#f8fafc] disabled:opacity-30 transition-all active:scale-95"
        >
          <ChevronLeft size={16} className="sm:size-20" />
          <span>Précédent</span>
        </button>

        {currentIdx === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!isAnswered}
            className={cn(
               "flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all transform active:scale-95 shadow-xl",
               isAnswered ? "bg-[#2563eb] text-white shadow-[#2563eb]/20 hover:bg-[#1d4ed8]" : "bg-[#334155] text-[#64748b] cursor-not-allowed"
            )}
          >
            <Flag size={16} className="sm:size-20" />
            <span>Terminer le Quiz</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(prev => prev + 1)}
            disabled={!isAnswered}
            className={cn(
               "flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95",
               isAnswered ? "bg-[#1e293b] border border-[#2563eb] text-white" : "bg-[#0f172a] border border-[#334155] text-[#64748b] cursor-not-allowed"
            )}
          >
            <span>Question Suivante</span>
            <ChevronRight size={16} className="sm:size-20" />
          </button>
        )}
      </div>
    </div>
  );
};
