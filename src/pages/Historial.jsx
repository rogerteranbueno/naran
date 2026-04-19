import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import WeeklyChart from '@/components/WeeklyChart';
import { generateWeeklyPDF } from '@/utils/generateReport';

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
const PULL_THRESHOLD = 64;

function cleanText(text = '') {
  return text
    .replace(/^el usuario (reporta sentirse|se siente)[^.]*\.\s*(su mensaje:?\s*)?/i, '')
    .replace(/^"(.+)"$/, '$1')
    .trim();
}

export default function Historial() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const scrollRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    const all = await base44.entities.ConflictLog.list('-created_date', 100);
    setTotal(all.length);
    setLogs(all.slice(0, PAGE_SIZE));
    setPage(1);
  }, []);

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false));
  }, [fetchLogs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    const user = await base44.auth.me().catch(() => null);
    // Get last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const all = await base44.entities.ConflictLog.list('-created_date', 100);
    const weekly = all.filter(l => new Date(l.created_date) >= since);
    generateWeeklyPDF(user?.full_name || 'Usuario', weekly.length > 0 ? weekly : all.slice(0, 10));
    setGeneratingPDF(false);
  };

  const loadMore = () => {
    base44.entities.ConflictLog.list('-created_date', 100).then(all => {
      const next = page + 1;
      setLogs(all.slice(0, next * PAGE_SIZE));
      setPage(next);
    });
  };

  const onTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e) => {
    if (scrollRef.current?.scrollTop === 0 && !refreshing) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) setPullY(Math.min(delta * 0.5, PULL_THRESHOLD + 16));
    }
  };

  const onTouchEnd = () => {
    if (pullY >= PULL_THRESHOLD) {
      handleRefresh();
    } else {
      // Spring-back physics
      let current = pullY;
      const interval = setInterval(() => {
        current *= 0.92; // Damping
        setPullY(current);
        if (current < 0.5) {
          clearInterval(interval);
          setPullY(0);
        }
      }, 16);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-8 pb-5">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors touch-none select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-medium text-foreground">
          Historial
        </p>
        <button
          onClick={handleDownloadPDF}
          disabled={generatingPDF || loading}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 touch-none select-none"
          title="Descargar informe PDF"
        >
          {generatingPDF
            ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            : <FileDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullY > 8 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: refreshing ? 40 : pullY }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <RefreshCw
              className={`w-4 h-4 text-primary transition-transform ${refreshing ? 'animate-spin' : ''}`}
              style={{ transform: refreshing ? undefined : `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pb-10 touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {!loading && logs.length > 0 && <WeeklyChart logs={logs} />}

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
                   className="flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors touch-none select-none"
                 >
                  <span className="text-xl shrink-0">{getEmoji(log.cognitive_note)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {cleanText(log.original_text)?.slice(0, 50)}{(cleanText(log.original_text)?.length || 0) > 50 ? '…' : ''}
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
                className="mt-4 w-full py-3 text-sm text-primary font-medium rounded-2xl border border-border hover:bg-secondary/40 transition-colors touch-none select-none"
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