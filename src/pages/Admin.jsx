import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u?.role !== 'admin') { navigate('/home'); return; }
      const all = await base44.entities.Testimonial.filter({ is_approved: false }, '-created_date', 50);
      setTestimonials(all);
      setLoading(false);
    }).catch(() => navigate('/home'));
  }, []);

  const approve = async (id) => {
    // Optimistic UI: remove immediately
    setTestimonials(prev => prev.filter(t => t.id !== id));
    // Then confirm with backend
    await base44.entities.Testimonial.update(id, { is_approved: true });
  };

  const reject = async (id) => {
    // Optimistic UI: remove immediately
    setTestimonials(prev => prev.filter(t => t.id !== id));
    // Then confirm with backend
    await base44.entities.Testimonial.delete(id);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex items-center px-5 pt-10 pb-5">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors touch-none select-none">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-semibold text-foreground mr-12">Admin · Testimonios</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3">
        {testimonials.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-16">No hay testimonios pendientes 🎉</p>
        ) : (
          testimonials.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl px-4 py-4 border border-border/40 shadow-sm">
              <p className="text-sm text-foreground leading-relaxed mb-3 italic">"{t.content}"</p>
              <div className="flex gap-2">
                <button onClick={() => approve(t.id)}
                  className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium text-green-700 touch-none select-none"
                  style={{ background: 'rgba(34,197,94,0.10)' }}>
                  <Check className="w-3.5 h-3.5" /> Aprobar
                </button>
                <button onClick={() => reject(t.id)}
                  className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 touch-none select-none"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <X className="w-3.5 h-3.5" /> Rechazar
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}