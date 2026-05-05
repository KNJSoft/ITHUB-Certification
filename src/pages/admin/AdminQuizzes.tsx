import React, { useEffect, useState } from 'react';
import { quizService } from '../../api/services';
import { Quiz } from '../../api/mockData';
import { Plus, Search, Edit2, Trash2, BookOpen, Calendar, Star, Award, ToggleRight as Toggle, Trash } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    category: '',
    description: '',
    attemptsAllowed: 2,
    expiresAt: ''
  });

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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#7c3aed]/10 rounded-lg"><BookOpen className="text-[#7c3aed]" size={28} /></div>
             <h1 className="text-4xl font-black tracking-tight text-white uppercase">Gestion des Quiz</h1>
          </div>
          <p className="text-[#64748b] font-medium tracking-wide mt-2">Créez et configurez vos examens de certification.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#7c3aed]/20 group active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Nouveau Quiz</span>
        </button>
      </header>

      <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#7c3aed10]">
          <div className="relative max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#475569]" size={20} />
            <input 
              type="text"
              placeholder="Rechercher par titre ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 transition-all font-medium placeholder:text-[#475569]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1d] text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">
                <th className="px-10 py-6 border-b border-[#7c3aed10]">Titre & Questions</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10]">Catégorie</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Expiration</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Essais</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Certifiés</th>
                <th className="px-8 py-6 border-b border-[#7c3aed10] text-center">Actif</th>
                <th className="px-10 py-6 border-b border-[#7c3aed10] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7c3aed05]">
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className="group hover:bg-[#7c3aed05]/40 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-[#7c3aed10] rounded-2xl flex items-center justify-center text-[#7c3aed] border border-[#7c3aed15] group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <p className="font-black text-white group-hover:text-[#7c3aed] transition-colors">{quiz.title}</p>
                        <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider mt-1">{quiz.questions.length} Questions</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="px-4 py-1.5 bg-[#7c3aed05] text-[#7c3aed] text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-[#7c3aed15]">
                      {quiz.category}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Calendar size={14} className="text-[#64748b]" />
                      <span className="text-[11px] font-bold text-[#94a3b8]">{quiz.expiresAt || 'Illimité'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-white font-mono font-bold">
                       <Star size={14} className="text-amber-500 fill-amber-500" />
                       <span>{quiz.attemptsAllowed}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-mono font-bold">
                       <Award size={14} />
                       <span>{Math.floor(Math.random() * 50)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                     <button className="text-[#7c3aed] hover:scale-110 transition-transform">
                        <Toggle size={32} strokeWidth={1} fill="currentColor" fillOpacity={0.1} />
                     </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                       <button className="p-3 bg-[#0a0f1d] hover:bg-[#7c3aed] text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(quiz.id)}
                        className="p-3 bg-[#0a0f1d] hover:bg-red-500 text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Quiz */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0a0f1d] border border-[#7c3aed30] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-10 border-b border-[#7c3aed10] flex justify-between items-center bg-gradient-to-r from-[#7c3aed05] to-transparent">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Créer un Nouveau Quiz</h2>
                <p className="text-xs text-[#64748b] font-medium mt-1 uppercase tracking-widest">Configurez les paramètres de certification</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#7c3aed10] text-[#7c3aed] flex items-center justify-center hover:bg-[#7c3aed] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Titre du Quiz</label>
                  <input 
                    type="text" 
                    placeholder="ex: Azure Solutions Architect"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-6 py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Catégorie</label>
                  <select 
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-6 py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 appearance-none"
                    value={newQuiz.category}
                    onChange={(e) => setNewQuiz({...newQuiz, category: e.target.value})}
                  >
                    <option value="">Sélectionner</option>
                    <option value="Cloud">Cloud</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Décrivez les objectifs de cette certification..."
                  className="w-full bg-[#0f172a] border border-[#7c3aed10] px-6 py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 resize-none"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Tentatives Autorisées</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-6 py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
                    value={newQuiz.attemptsAllowed}
                    onChange={(e) => setNewQuiz({...newQuiz, attemptsAllowed: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Date d'expiration</label>
                  <input 
                    type="date"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-6 py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
                    value={newQuiz.expiresAt}
                    onChange={(e) => setNewQuiz({...newQuiz, expiresAt: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-[#0f172a] border border-[#7c3aed10] text-[#64748b] rounded-2xl font-black uppercase tracking-widest text-xs hover:border-[#7c3aed] transition-all"
                >
                  Annuler
                </button>
                <button 
                  className="flex-[2] py-5 bg-[#7c3aed] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#7c3aed]/20 hover:bg-[#6d28d9] transition-all active:scale-95"
                >
                  Générer le Quiz
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
