import React, { useEffect, useState } from 'react';
import { quizService } from '../../api/services';
import { Quiz } from '../../api/types';
import { Plus, Search, Edit2, Trash2, BookOpen, Calendar, Star, Award, ToggleRight as Toggle, Trash } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    category: '',
    description: '',
    attemptsAllowed: 2,
    difficulty: 'medium',
    trainer_name: '',
    timer_minutes: 30,
    min_score_percentage: 80,
    validity_hours: 24,
    questions: [] as any[]
  });

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getAdminQuizzes();
        setQuizzes(data);
        console.log('quiz',data)
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des quiz');
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
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du quiz');
    }
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.title || !newQuiz.trainer_name || newQuiz.questions.length === 0) {
      setError('Veuillez remplir le titre, le nom du formateur et ajouter au moins une question');
      return;
    }
    setLoading(true);
    try {
      const quizData = {
        title: newQuiz.title,
        description: newQuiz.description,
        category: newQuiz.category,
        difficulty: newQuiz.difficulty,
        trainer_name: newQuiz.trainer_name,
        timer_minutes: newQuiz.timer_minutes,
        min_score_percentage: newQuiz.min_score_percentage,
        max_attempts: newQuiz.attemptsAllowed,
        validity_hours: newQuiz.validity_hours,
        questions: newQuiz.questions
      };
      console.log('Données envoyées au backend:', quizData);
      const result = await quizService.createQuiz(quizData);
      console.log('Résultat du backend:', result);
      setIsModalOpen(false);
      setNewQuiz({
        title: '',
        category: '',
        description: '',
        attemptsAllowed: 2,
        difficulty: 'medium',
        trainer_name: '',
        timer_minutes: 30,
        min_score_percentage: 80,
        validity_hours: 24,
        questions: []
      });
      // Recharger la liste des quiz
      const data = await quizService.getAdminQuizzes();
      setQuizzes(data);

    } catch (err: any) {
      console.error('Erreur lors de la création du quiz:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      setError(err.message || 'Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!editingQuiz) return;
    if (!newQuiz.title || !newQuiz.trainer_name || newQuiz.questions.length === 0) {
      setError('Veuillez remplir le titre, le nom du formateur et ajouter au moins une question');
      return;
    }
    setLoading(true);
    try {
      const quizData = {
        title: newQuiz.title,
        description: newQuiz.description,
        category: newQuiz.category,
        difficulty: newQuiz.difficulty,
        trainer_name: newQuiz.trainer_name,
        timer_minutes: newQuiz.timer_minutes,
        min_score_percentage: newQuiz.min_score_percentage,
        max_attempts: newQuiz.attemptsAllowed,
        validity_hours: newQuiz.validity_hours,
        questions: newQuiz.questions
      };
      console.log('Données envoyées au backend pour mise à jour:', quizData);
      const result = await quizService.updateQuiz(editingQuiz.id, quizData);
      console.log('Résultat du backend:', result);
      setIsModalOpen(false);
      setEditingQuiz(null);
      setNewQuiz({
        title: '',
        category: '',
        description: '',
        attemptsAllowed: 2,
        difficulty: 'medium',
        trainer_name: '',
        timer_minutes: 30,
        min_score_percentage: 80,
        validity_hours: 24,
        questions: []
      });
      // Recharger la liste des quiz
      const data = await quizService.getAdminQuizzes();
      setQuizzes(data);

    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du quiz:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      setError(err.message || 'Erreur lors de la mise à jour du quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quiz: Quiz) => {
    setLoading(true);
    try {
      // Récupérer les détails complets du quiz avec les questions
      const quizDetails = await quizService.getAdminQuizById(quiz.id);
      console.log('QuizDetails récupérés:', quizDetails);
      setEditingQuiz(quizDetails);
      setNewQuiz({
        title: quizDetails.title,
        category: quizDetails.category,
        description: quizDetails.description,
        attemptsAllowed: quizDetails.max_attempts,
        difficulty: quizDetails.difficulty,
        trainer_name: quizDetails.trainer_name,
        timer_minutes: quizDetails.timer_minutes,
        min_score_percentage: quizDetails.min_score_percentage,
        validity_hours: quizDetails.validity_hours,
        questions: quizDetails.questions || []
      });
      console.log('newQuiz après setNewQuiz:', {
        title: quizDetails.title,
        category: quizDetails.category,
        description: quizDetails.description,
        attemptsAllowed: quizDetails.max_attempts,
        difficulty: quizDetails.difficulty,
        trainer_name: quizDetails.trainer_name,
        timer_minutes: quizDetails.timer_minutes,
        min_score_percentage: quizDetails.min_score_percentage,
        validity_hours: quizDetails.validity_hours,
        questions: quizDetails.questions || []
      });
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des détails du quiz');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = Array.isArray(quizzes['results']) && quizzes['results'].filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="p-2 bg-[#7c3aed]/10 rounded-lg"><BookOpen className="text-[#7c3aed]" size={20} /></div>
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Gestion des Quiz</h1>
          </div>
          <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium tracking-wide mt-1 sm:mt-2">Créez et configurez vos examens de certification.</p>
        </div>
        <button
          onClick={() => {
            setEditingQuiz(null);
            setNewQuiz({
              title: '',
              category: '',
              description: '',
              attemptsAllowed: 2,
              difficulty: 'medium',
              trainer_name: '',
              timer_minutes: 30,
              min_score_percentage: 80,
              validity_hours: 24,
              questions: []
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 sm:gap-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#7c3aed]/20 group active:scale-95"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Nouveau Quiz</span>
        </button>
      </header>

      <div className="bg-[#0a0f1d] border border-[#7c3aed10] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 md:p-8 border-b border-[#7c3aed10]">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
            <input 
              type="text"
              placeholder="Rechercher par titre ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-[#0f172a] border border-[#7c3aed10] rounded-2xl text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 transition-all font-medium placeholder:text-[#475569] text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1d] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">
                <th className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-[#7c3aed10]">Titre & Questions</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] hidden sm:table-cell">Catégorie</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden md:table-cell">Expiration</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden sm:table-cell">Essais</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden sm:table-cell">Tentatives</th>
                <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#7c3aed10] text-center hidden md:table-cell">Actif</th>
                <th className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-[#7c3aed10] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7c3aed05]">
              {Array.isArray(filteredQuizzes) && filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className="group hover:bg-[#7c3aed05]/40 transition-all">
                  <td className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7c3aed10] rounded-2xl flex items-center justify-center text-[#7c3aed] border border-[#7c3aed15] group-hover:scale-110 transition-transform">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="font-black text-white group-hover:text-[#7c3aed] transition-colors text-xs sm:text-sm md:text-base">{quiz.title}</p>
                        <p className="text-[9px] sm:text-[10px] text-[#64748b] font-bold uppercase tracking-wider mt-1">{quiz.questions_count || 'N/A'} Questions</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 hidden sm:table-cell">
                    <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#7c3aed05] text-[#7c3aed] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-[#7c3aed15]">
                      {quiz.category}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden md:table-cell">
                    <div className="flex flex-col items-center gap-1">
                      <Calendar size={12} className="text-[#64748b]" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8]">{new Date(quiz.expiration_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white font-mono font-bold">
                       <Star size={12} className="text-amber-500 fill-amber-500" />
                       <span>{quiz.max_attempts}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-emerald-500 font-mono font-bold">
                       <Award size={12}/>
                       <span>{quiz.attempts_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-center hidden md:table-cell">
                     <button className="text-[#7c3aed] hover:scale-110 transition-transform">
                        <Toggle size={24} sm:size-32 strokeWidth={1} fill="currentColor" fillOpacity={quiz.is_active ? 1 : 0.1} />
                     </button>
                  </td>
                  <td className="px-4 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 text-right">
                    <div className="flex justify-end gap-2 sm:gap-3">
                       <button
                        onClick={() => handleEditQuiz(quiz)}
                        className="p-2 sm:p-3 bg-[#0a0f1d] hover:bg-[#7c3aed] text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="p-2 sm:p-3 bg-[#0a0f1d] hover:bg-red-500 text-[#64748b] hover:text-white rounded-xl border border-[#7c3aed10] transition-all shadow-sm"
                      >
                        <Trash size={14} />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0a0f1d] border border-[#7c3aed30] w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8 md:p-10 border-b border-[#7c3aed10] flex justify-between items-center bg-gradient-to-r from-[#7c3aed05] to-transparent">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{editingQuiz ? 'Modifier le Quiz' : 'Créer un Nouveau Quiz'}</h2>
                <p className="text-[10px] sm:text-xs text-[#64748b] font-medium mt-1 uppercase tracking-widest">{editingQuiz ? 'Mettez à jour les paramètres de certification' : 'Configurez les paramètres de certification'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7c3aed10] text-[#7c3aed] flex items-center justify-center hover:bg-[#7c3aed] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Titre du Quiz</label>
                  <input 
                    type="text" 
                    placeholder="ex: Azure Solutions Architect"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Catégorie</label>
                  <select 
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 appearance-none text-sm sm:text-base"
                    value={newQuiz.category}
                    onChange={(e) => setNewQuiz({...newQuiz, category: e.target.value})}
                  >
                    <option value="">Sélectionner</option>
                    <option value="Cloud">Cloud</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Security">Security</option>
                    <option value="Backend">Backend</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Data">Data</option>
                    <option value="AI">AI</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="IoT">IoT</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Database">Database</option>
                    <option value="Networking">Networking</option>
                    {/* other categories */}
                    <option value="Other">Autre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Difficulté</label>
                  <select 
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 appearance-none text-sm sm:text-base"
                    value={newQuiz.difficulty}
                    onChange={(e) => setNewQuiz({...newQuiz, difficulty: e.target.value})}
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Formateur</label>
                  <input 
                    type="text" 
                    placeholder="Nom du formateur"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newQuiz.trainer_name}
                    onChange={(e) => setNewQuiz({...newQuiz, trainer_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Décrivez les objectifs de cette certification..."
                  className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 resize-none text-sm sm:text-base"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Durée (min)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newQuiz.timer_minutes}
                    onChange={(e) => setNewQuiz({...newQuiz, timer_minutes: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Score min (%)</label>
                  <input 
                    type="number" 
                    min="1" max="100"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newQuiz.min_score_percentage}
                    onChange={(e) => setNewQuiz({...newQuiz, min_score_percentage: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Validité (h)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                    value={newQuiz.validity_hours}
                    onChange={(e) => setNewQuiz({...newQuiz, validity_hours: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Tentatives Autorisées</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-[#0f172a] border border-[#7c3aed10] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 text-sm sm:text-base"
                  value={newQuiz.attemptsAllowed}
                  onChange={(e) => setNewQuiz({...newQuiz, attemptsAllowed: parseInt(e.target.value)})}
                />
              </div>

              <div className="border-t border-[#7c3aed10] pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Questions ({newQuiz.questions.length})</h3>
                  <button 
                    onClick={() => {
                      setNewQuiz({
                        ...newQuiz,
                        questions: [...newQuiz.questions, {
                          text: '',
                          options: [
                            { text: '', is_correct: false },
                            { text: '', is_correct: false },
                            { text: '', is_correct: false },
                            { text: '', is_correct: false }
                          ]
                        }]
                      });
                    }}
                    className="px-4 py-2 bg-[#7c3aed] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6d28d9] transition-all"
                  >
                    + Ajouter Question
                  </button>
                </div>

                {newQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="bg-[#0f172a] border border-[#7c3aed10] rounded-2xl p-6 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Question {qIndex + 1}</label>
                      <button 
                        onClick={() => {
                          setNewQuiz({
                            ...newQuiz,
                            questions: newQuiz.questions.filter((_, i) => i !== qIndex)
                          });
                        }}
                        className="text-red-500 hover:text-red-400 text-xs font-bold"
                      >
                        Supprimer
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Écrivez votre question ici..."
                      className="w-full bg-[#0a0f1d] border border-[#7c3aed10] px-4 py-3 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 resize-none mb-4"
                      value={question.text}
                      onChange={(e) => {
                        const updatedQuestions = [...newQuiz.questions];
                        updatedQuestions[qIndex].text = e.target.value;
                        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                      }}
                    />
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={option.is_correct}
                            onChange={() => {
                              const updatedQuestions = [...newQuiz.questions];
                              updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((opt, i) => ({
                                ...opt,
                                is_correct: i === oIndex
                              }));
                              setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                            }}
                            className="w-4 h-4 accent-[#7c3aed]"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 bg-[#0a0f1d] border border-[#7c3aed10] px-4 py-2 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
                            value={option.text}
                            onChange={(e) => {
                              const updatedQuestions = [...newQuiz.questions];
                              updatedQuestions[qIndex].options[oIndex].text = e.target.value;
                              setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 sm:py-4 md:py-5 bg-[#0f172a] border border-[#7c3aed10] text-[#64748b] rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:border-[#7c3aed] transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
                  disabled={loading}
                  className="flex-[2] py-3 sm:py-4 md:py-5 bg-[#7c3aed] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-[#7c3aed]/20 hover:bg-[#6d28d9] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editingQuiz ? 'Mise à jour...' : 'Création...') : (editingQuiz ? 'Mettre à jour le Quiz' : 'Générer le Quiz')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
