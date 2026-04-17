import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function getEmoji(cognitiveNote = '') {
  const n = cognitiveNote.toLowerCase();
  if (n.includes('crítica') || n.includes('generalización') || n.includes('enojo')) return '😤';
  if (n.includes('tristeza') || n.includes('herido') || n.includes('invisible')) return '😔';
  if (n.includes('ansiedad') || n.includes('preocupación')) return '😰';
  if (n.includes('evasión') || n.includes('silencio') || n.includes('evasiva')) return '😶';
  return '💭';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function LogDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(state || null);

  useEffect(() => {
    if (!log && id) {
      base44.entities.ConflictLog.list().then(logs => {
        const found = logs.find(l => l.id === id);
        if (found) setLog(found);
      }).catch(() => {});
    }
  }, [id, log]);

  if (!log) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const emoji = getEmoji(log.cognitive_note);

  return (
    <div className="flex-1 flex flex-col px-5 py-8">
      {/* Top bar */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al inicio</span>
        </button>
      </div>

      {/* Emoji grande */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <span className="text-6xl mb-2">{emoji}</span>
        <p className="text-xs text-muted-foreground capitalize">{formatDate(log.created_date)}</p>
      </motion.div>

      {/* Original text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Dijiste:</p>
        <div className="rounded-xl px-4 py-3" style={{ background: '#F3F1EB' }}>
          <p className="text-sm text-foreground/70 leading-relaxed italic">"{log.original_text}"</p>
        </div>
      </motion.div>

      {/* Cognitive note */}
      {log.cognitive_note && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 mb-5"
        >
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Naran detectó: </span>
            <span style={{ color: '#E07A5F' }}>{log.cognitive_note}</span>
          </p>
        </motion.div>
      )}

      {/* Reframe message */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-semibold text-foreground mb-3">Sugirió decir:</p>
        <div className="rounded-2xl border border-border bg-white px-5 py-5 shadow-sm">
          <p className="text-lg leading-relaxed" style={{ color: '#2C2C2C' }}>
            {log.reframe_message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}