import React, { useEffect, useState } from 'react';
import { studentService } from '../../api/services';
import { Certification } from '../../api/mockData';
import { Award, Download, Calendar, ExternalLink, Share2, Medal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Certifications: React.FC = () => {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await studentService.getCertifications();
        setCerts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <Medal className="text-[#2563eb]" size={32} />
           <h1 className="text-4xl font-black tracking-tight text-white uppercase">Mes Certifications</h1>
        </div>
        <p className="text-[#64748b] font-medium tracking-wide">Historique de vos accomplissements et badges obtenus.</p>
      </header>

      {certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-[#0a0f1d] rounded-[3rem] border border-[#2563eb10] border-dashed relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#2563eb05] to-transparent opacity-50" />
          <div className="w-24 h-24 bg-[#0f172a] border border-[#2563eb10] rounded-3xl flex items-center justify-center mb-8 text-[#2563eb]">
            <Award size={48} className="animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Aucun badge pour le moment</h3>
          <p className="text-[#64748b] font-medium mb-12 text-center max-w-sm">Relevez le défi de nos quiz pour obtenir vos premières certifications officielles.</p>
          <button className="bg-[#2563eb] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#2563eb]/20 hover:-translate-y-1 transition-all active:scale-95">
            Parcourir les Quizzes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certs.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0a0f1d] border border-[#2563eb10] rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center group relative overflow-hidden hover:border-[#2563eb40] transition-colors"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#2563eb] opacity-5 blur-[100px] pointer-events-none" />
              
              <div className="w-32 h-32 bg-gradient-to-br from-[#2563eb] to-[#4f46e5] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#2563eb]/30 shrink-0 transform group-hover:rotate-6 transition-all duration-500 relative">
                <Award size={64} className="text-white drop-shadow-lg" />
                <div className="absolute -bottom-2 -right-2 bg-white text-[#2563eb] px-3 py-1 rounded-lg font-black text-[10px] uppercase shadow-lg">OFFICIEL</div>
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase group-hover:text-[#2563eb] transition-colors leading-tight mb-2">{cert.quizTitle}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-black tracking-widest uppercase text-[#64748b]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#2563eb]" />
                      <span>Obtenu le {cert.issueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Medal size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Score: {cert.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/10 active:scale-95">
                    <Download size={14} />
                    <span>PDF</span>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0f1d] border border-[#2563eb20] text-[#2563eb] rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-[#2563eb10] active:scale-95">
                    <Share2 size={14} />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
