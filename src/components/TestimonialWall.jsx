import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function TestimonialWall() {
  const [testimonials, setTestimonials] = useState([]);
  const [applauded, setApplauded] = useState([]);

  useEffect(() => {
    base44.entities.Testimonial.filter({ is_approved: true }, '-applause_count', 3)
      .then(setTestimonials).catch(() => {});
    const saved = localStorage.getItem('naran_applauded');
    if (saved) setApplauded(JSON.parse(saved));
  }, []);

  const applaud = async (t) => {
    if (applauded.includes(t.id)) return;
    // Optimistic UI: update immediately
    const next = [...applauded, t.id];
    setApplauded(next);
    setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, applause_count: (x.applause_count || 0) + 1 } : x));
    localStorage.setItem('naran_applauded', JSON.stringify(next));
    // Sync to backend (fire and forget)
    base44.entities.Testimonial.update(t.id, { applause_count: (t.applause_count || 0) + 1 }).catch(() => {});
  };

  if (testimonials.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Historias que inspiran</p>
      <div className="space-y-3">
        {testimonials.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl px-4 py-4 border"
            style={{ background: '#FDFBF7', borderColor: '#E0DCD3' }}>
            <p className="text-sm text-foreground/80 leading-relaxed italic mb-3">"{t.content}"</p>
            <button onClick={() => applaud(t)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: applauded.includes(t.id) ? '#E07A5F' : '#999' }}>
              <span>🙌</span>
              <span>{t.applause_count || 0} {t.applause_count === 1 ? 'aplauso' : 'aplausos'}</span>
              {!applauded.includes(t.id) && <span className="ml-1 underline">Aplaudir</span>}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}