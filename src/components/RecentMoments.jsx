import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getEmoji(cognitiveNote = '') {
  const n = cognitiveNote.toLowerCase();
  if (n.includes('crítica') || n.includes('generalización') || n.includes('enojo')) return '😤';
  if (n.includes('tristeza') || n.includes('herido') || n.includes('invisible')) return '😔';
  if (n.includes('ansiedad') || n.includes('preocupación')) return '😰';
  if (n.includes('evasión') || n.includes('silencio') || n.includes('evasiva')) return '😶';
  return '💭';
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs < 0) return 'Ahora';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

function snippet(text = '', max = 38) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function RecentMoments({ logs }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-8"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Momentos recientes
      </p>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Sparkles className="w-5 h-5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[240px]">
            Aquí aparecerán los momentos que decidas guardar. Naran te ayuda a ver patrones con el tiempo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border overflow-hidden bg-white">
          {logs.map((log, i) => (
            <motion.button
              key={log.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              onClick={() => navigate(`/log/${log.id}`, { state: log })}
              className="flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
            >
              <span className="text-xl shrink-0">{getEmoji(log.cognitive_note)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{snippet(log.original_text)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.created_date)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}