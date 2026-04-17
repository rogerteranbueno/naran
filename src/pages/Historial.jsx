import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs < 0) return 'Ahora';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

function getEmoji(cognitiveNote = '') {
  const n = cognitiveNote.toLowerCase();
  if (n.includes('crítica') || n.includes('generalización')) return '😤';
  if (n.includes('tristeza') || n.includes('herido')) return '😔';
  if (n.includes('ansiedad') || n.includes('miedo')) return '😰';
  if (n.includes('evasiv') || n.includes('silencio')) return '😶';
  return '💭';
}

const PAGE_SIZE = 10;

export default function Historial() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    base44.entities.ConflictLog.list('-created_date', 100).then(all => {
      setTotal(all.length);
      setLogs(all.slice(0, PAGE_SIZE));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadMore = () => {
    base44.entities.ConflictLog.list('-created_date', 100).then(all => {
      const next = page + 1;
      setLogs(all.slice(0, next * PAGE_SIZE));
      setPage(next);
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-8 pb-5">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-medium text-foreground mr-12">
          Historial
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-16">No hay momentos guardados aún.</p>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border overflow-hidden bg-white">
              {logs.map((log, i) => (
                <motion.button
                  key={log.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/log/${log.id}`, { state: log })}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-xl shrink-0">{getEmoji(log.cognitive_note)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {log.original_text?.slice(0, 50)}{log.original_text?.length > 50 ? '…' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    log.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    log.status === 'escalated' ? 'bg-red-100 text-red-600' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {log.status === 'resolved' ? 'Resuelto' : log.status === 'escalated' ? 'Escaló' : 'Pendiente'}
                  </span>
                </motion.button>
              ))}
            </div>

            {logs.length < total && (
              <button
                onClick={loadMore}
                className="mt-4 w-full py-3 text-sm text-primary font-medium rounded-2xl border border-border hover:bg-secondary/40 transition-colors"
              >
                Cargar más
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}