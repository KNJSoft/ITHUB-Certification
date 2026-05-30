import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../api/services';
import { AdminStats } from '../../api/types';
import { Users, Award, TrendingUp, BarChart3, Zap, ChevronRight, UserPlus, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
     <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Inscrits', 
      value: stats?.total_users || 0, 
      change: stats?.users_growth ? `${stats.users_growth >= 0 ? '+' : ''}${stats.users_growth}%` : '+0%', 
      icon: Users, 
      color: 'bg-blue-500', 
      trend: (stats?.users_growth || 0) >= 0 ? 'up' : 'down' 
    },
    { 
      label: 'Quiz Actifs', 
      value: stats?.total_quizzes || 0, 
      change: stats?.quizzes_growth ? `${stats.quizzes_growth >= 0 ? '+' : ''}${stats.quizzes_growth}%` : '+0%', 
      icon: Award, 
      color: 'bg-emerald-500', 
      trend: (stats?.quizzes_growth || 0) >= 0 ? 'up' : 'down' 
    },
    { 
      label: 'Tentatives Quiz', 
      value: stats?.total_attempts || 0, 
      change: stats?.attempts_growth ? `${stats.attempts_growth >= 0 ? '+' : ''}${stats.attempts_growth}%` : '+0%', 
      icon: Zap, 
      color: 'bg-[#7c3aed]', 
      trend: (stats?.attempts_growth || 0) >= 0 ? 'up' : 'down' 
    },
    { 
      label: 'Certifications', 
      value: stats?.total_certifications || 0, 
      change: stats?.certifications_growth ? `${stats.certifications_growth >= 0 ? '+' : ''}${stats.certifications_growth}%` : '+0%', 
      icon: TrendingUp, 
      color: 'bg-amber-500', 
      trend: (stats?.certifications_growth || 0) >= 0 ? 'up' : 'down' 
    },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <BarChart3 className="text-[#7c3aed]" size={32} />
           <h1 className="text-4xl font-black tracking-tight text-white uppercase">Vue d'ensemble</h1>
        </div>
        <p className="text-[#64748b] font-medium tracking-wide">Performances globales de la plateforme de certification.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0a0f1d] border border-[#7c3aed20] p-8 rounded-[2rem] hover:border-[#7c3aed50] transition-colors group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-5 blur-[80px] -mr-16 -mt-16`} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-4 rounded-2xl shadow-lg", stat.color)}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {stat.change}
              </div>
            </div>

            <p className="text-[#64748b] text-[10px] uppercase font-black tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#0a0f1d] border border-[#7c3aed10] rounded-[2.5rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Activité Récente</h2>
              <p className="text-xs text-[#64748b] font-medium mt-1">Dernières activités de la plateforme (certifications, quiz créés, inscriptions, tentatives).</p>
            </div>
            <Link to="/admin/activity"  className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest hover:underline px-4 py-2 bg-[#7c3aed10] rounded-full">
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#64748b] font-medium">Aucune activité récente</p>
              </div>
            ) : (
              recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-5 rounded-3xl bg-[#0f172a50] border border-[#7c3aed05] hover:border-[#7c3aed20] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform",
                      activity.type === 'certification' && "bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]",
                      activity.type === 'quiz_created' && "bg-gradient-to-br from-emerald-500 to-green-600",
                      activity.type === 'user_registered' && "bg-gradient-to-br from-blue-500 to-cyan-600",
                      activity.type === 'quiz_attempt' && "bg-gradient-to-br from-amber-500 to-orange-600"
                    )}>
                      {activity.type === 'certification' && <Award size={20} />}
                      {activity.type === 'quiz_created' && <BookOpen size={20} />}
                      {activity.type === 'user_registered' && <UserPlus size={20} />}
                      {activity.type === 'quiz_attempt' && <CheckCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-white text-sm uppercase">
                        {activity.type === 'certification' && activity.user_name}
                        {activity.type === 'quiz_created' && 'Nouveau quiz créé'}
                        {activity.type === 'user_registered' && activity.user_name}
                        {activity.type === 'quiz_attempt' && activity.user_name}
                      </p>
                      <p className="text-[10px] text-[#64748b] font-medium tracking-wider">
                        {activity.type === 'certification' && `A obtenu le badge ${activity.quiz_title}`}
                        {activity.type === 'quiz_created' && `${activity.quiz_title} (${activity.quiz_category})`}
                        {activity.type === 'user_registered' && `Nouvel étudiant inscrit: ${activity.user_email}`}
                        {activity.type === 'quiz_attempt' && `Tentative: ${activity.quiz_title} - ${activity.passed ? 'Réussi' : 'Échoué'}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#64748b] text-[10px] font-mono">{activity.time_ago}</p>
                    {activity.type === 'certification' && (
                      <p className="text-emerald-500 text-[10px] font-bold uppercase mt-1">Score: {activity.score}%</p>
                    )}
                    {activity.type === 'quiz_attempt' && (
                      <p className={cn(
                        "text-[10px] font-bold uppercase mt-1",
                        activity.passed ? "text-emerald-500" : "text-red-500"
                      )}>
                        Score: {activity.score}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[100px] -mr-32 -mt-32" />
          <UserPlus size={48} className="text-white/20 mb-6" />
          <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight mb-4">Besoin de plus de quiz ?</h2>
          <p className="text-white/80 font-medium mb-10 leading-relaxed">Générez instantanément un nouveau parcours de certification avec notre outil de création assistée.</p>
          <button 
            onClick={() => navigate('/admin/quizzes')}
            className="w-full py-5 bg-white text-[#7c3aed] rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Créer un Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
