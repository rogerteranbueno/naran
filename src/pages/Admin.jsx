import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import KPICard from '@/components/admin/KPICard';
import LogsTable from '@/components/admin/LogsTable';

const TABS = ['KPIs', 'Logs', 'Testimonios'];

function getModeEmotion(logs) {
  const counts = {};
  logs.forEach(l => { if (l.emotion_label) counts[l.emotion_label] = (counts[l.emotion_label] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('KPIs');
  const [testimonials, setTestimonials] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const u = await base44.auth.me();
    if (u?.role !== 'admin') { navigate('/home'); return; }

    const [allLogs, allUsers, pendingT] = await Promise.all([
      base44.entities.ConflictLog.list('-created_date', 100),
      base44.entities.User.list('-created_date', 200),
      base44.entities.Testimonial.filter({ is_approved: false }, '-created_date', 50),
    ]);

    setLogs(allLogs);
    setUsers(allUsers);
    setTestimonials(pendingT);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => navigate('/home'));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData().catch(() => {});
    setRefreshing(false);
  };

  const approve = async (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    await base44.entities.Testimonial.update(id, { is_approved: true });
  };

  const reject = async (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    await base44.entities.Testimonial.delete(id);
  };

  // KPI calculations
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const logsToday = logs.filter(l => new Date(l.created_date) >= today).length;
  const sentRate = logs.length > 0 ? Math.round((logs.filter(l => l.action_taken === 'sent').length / logs.length) * 100) : 0;
  const topEmotion = getModeEmotion(logs.filter(l => {
    const d = new Date(l.created_date);
    const week = new Date(); week.setDate(week.getDate() - 7);
    return d >= week;
  }));

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center px-5 pt-10 pb-4">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors touch-none select-none">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-semibold text-foreground">Admin</p>
        <button onClick={handleRefresh} className="text-muted-foreground hover:text-foreground transition-colors touch-none select-none">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 mb-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors touch-none select-none"
            style={tab === t
              ? { background: '#E07A5F', color: '#fff' }
              : { background: 'rgba(0,0,0,0.04)', color: '#888' }}
          >
            {t} {t === 'Testimonios' && testimonials.length > 0 && `(${testimonials.length})`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">

        {/* KPIs Tab */}
        {tab === 'KPIs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KPICard label="Usuarios Totales" value={users.length} sub="registrados" />
              <KPICard label="Momentos Hoy" value={logsToday} sub="registrados hoy" color="#4CAF82" />
              <KPICard label="Tasa Enviado" value={`${sentRate}%`} sub="de reframes enviados" color="#6B8ED6" />
              <KPICard label="Emoción Principal" value={topEmotion} sub="esta semana" color="#C9614A" />
            </div>

            <div className="bg-white rounded-2xl border border-border/40 px-4 py-4 shadow-sm mt-2">
              <p className="text-xs font-semibold text-foreground mb-3">Total de logs: {logs.length}</p>
              <div className="space-y-2">
                {['enojo', 'tristeza', 'ansiedad', 'confusion'].map(emo => {
                  const count = logs.filter(l => l.emotion_label === emo).length;
                  const pct = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
                  return (
                    <div key={emo}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{emo}</span>
                        <span className="text-xs text-foreground font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#E07A5F' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {tab === 'Logs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-muted-foreground mb-3">Últimos 20 registros</p>
            <LogsTable logs={logs.slice(0, 20)} />
          </motion.div>
        )}

        {/* Testimonios Tab */}
        {tab === 'Testimonios' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}