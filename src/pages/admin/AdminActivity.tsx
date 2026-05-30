import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import { Award, BookOpen, UserPlus, CheckCircle, Activity, Calendar, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminActivity: React.FC = () => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activityData = await adminService.getRecentActivity();
        setRecentActivity(activityData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des activités');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredActivities = filterType === 'all' 
    ? recentActivity 
    : recentActivity.filter(activity => activity.type === filterType);

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

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7c3aed]/10 rounded-lg">
              <Activity className="text-[#7c3aed]" size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">Activité Récente</h1>
          </div>
          <p className="text-[#64748b] font-medium tracking-wide mt-2">Historique complet des activités de la plateforme.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-6 py-3 bg-[#0f172a] border border-[#7c3aed10] rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 appearance-none cursor-pointer"
            >
              <option value="all">Toutes les activités</option>
              <option value="certification">Certifications</option>
              <option value="quiz_created">Quiz créés</option>
              <option value="user_registered">Inscriptions</option>
              <option value="quiz_attempt">Tentatives</option>
            </select>
          </div>
        </div>
      </header>

      <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#7c3aed10] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar size={20} className="text-[#64748b]" />
            <span className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">
              {filteredActivities.length} activités trouvées
            </span>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="text-[#64748b] mx-auto mb-4" />
              <p className="text-[#64748b] font-medium">Aucune activité trouvée</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-6 rounded-3xl bg-[#0f172a50] border border-[#7c3aed05] hover:border-[#7c3aed20] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform",
                    activity.type === 'certification' && "bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]",
                    activity.type === 'quiz_created' && "bg-gradient-to-br from-emerald-500 to-green-600",
                    activity.type === 'user_registered' && "bg-gradient-to-br from-blue-500 to-cyan-600",
                    activity.type === 'quiz_attempt' && "bg-gradient-to-br from-amber-500 to-orange-600"
                  )}>
                    {activity.type === 'certification' && <Award size={24} />}
                    {activity.type === 'quiz_created' && <BookOpen size={24} />}
                    {activity.type === 'user_registered' && <UserPlus size={24} />}
                    {activity.type === 'quiz_attempt' && <CheckCircle size={24} />}
                  </div>
                  <div>
                    <p className="font-black text-white text-sm uppercase">
                      {activity.type === 'certification' && activity.user_name}
                      {activity.type === 'quiz_created' && 'Nouveau quiz créé'}
                      {activity.type === 'user_registered' && activity.user_name}
                      {activity.type === 'quiz_attempt' && activity.user_name}
                    </p>
                    <p className="text-[11px] text-[#64748b] font-medium tracking-wider">
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
                    <p className="text-emerald-500 text-[11px] font-bold uppercase mt-1">Score: {activity.score}%</p>
                  )}
                  {activity.type === 'quiz_attempt' && (
                    <p className={cn(
                      "text-[11px] font-bold uppercase mt-1",
                      activity.passed ? "text-emerald-500" : "text-red-500"
                    )}>
                      Score: {activity.score}%
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
