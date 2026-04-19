import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'NARAN-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const BADGES = [
  { days: 3,  emoji: '🌱', label: 'Brotes', desc: '3 días juntos' },
  { days: 7,  emoji: '🍊', label: 'Equipo Naranja', desc: '1 semana de racha' },
  { days: 14, emoji: '🌺', label: 'En Flor', desc: '2 semanas de racha' },
  { days: 30, emoji: '🌳', label: 'Raíces Fuertes', desc: '30 días de racha' },
];

function getLevel(streak) {
  const earned = BADGES.filter(b => streak >= b.days);
  const current = earned[earned.length - 1] || null;
  const next = BADGES.find(b => streak < b.days) || null;
  return { current, next, earned };
}

export default function Espacio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const rels = await base44.entities.Relationship.list('-created_date', 20);
      const mine = rels.find(r => r.user1_email === u.email || r.user2_email === u.email);
      setRelationship(mine || null);

      if (mine?.status === 'active') {
        const pEmail = mine.user1_email === u.email ? mine.user2_email : mine.user1_email;
        const allUsers = await base44.entities.User.list('-created_date', 200).catch(() => []);
        const partner = allUsers.find(x => x.email === pEmail);
        if (partner?.full_name) setPartnerName(partner.full_name.split(' ')[0]);
        await loadMetrics(u, mine);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadMetrics = async (u, rel) => {
    const partnerEmail = rel.user1_email === u.email ? rel.user2_email : rel.user1_email;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [myLogs, partnerLogs] = await Promise.all([
      base44.entities.ConflictLog.filter({ user_email: u.email }, '-created_date', 100),
      base44.entities.ConflictLog.filter({ user_email: partnerEmail }, '-created_date', 100),
    ]);

    const myDays = new Set(myLogs.map(l => new Date(l.created_date).toDateString()));
    const partnerDays = new Set(partnerLogs.map(l => new Date(l.created_date).toDateString()));
    let sharedStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      if (myDays.has(ds) && partnerDays.has(ds)) sharedStreak++;
      else if (i > 0) break;
    }

    const recentMy = myLogs.filter(l => l.created_date > oneWeekAgo);
    const recentPartner = partnerLogs.filter(l => l.created_date > oneWeekAgo);
    const allRecent = [...recentMy, ...recentPartner];
    const emotionCounts = { enojo: 0, tristeza: 0, ansiedad: 0, confusion: 0 };
    allRecent.forEach(l => { if (l.emotion_label && emotionCounts[l.emotion_label] !== undefined) emotionCounts[l.emotion_label]++; });
    const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    const isCalm = dominant[1] === 0;

    setMetrics({
      sharedStreak,
      thermometer: isCalm
        ? { emoji: '🌿', label: 'Semana tranquila', color: '#81B29A', bg: 'rgba(129,178,154,0.12)' }
        : dominant[0] === 'enojo'
        ? { emoji: '🔥', label: 'Momento de tensión', color: '#E07A5F', bg: 'rgba(224,122,95,0.12)' }
        : { emoji: '💙', label: 'Semana de reflexión', color: '#7B9CC4', bg: 'rgba(123,156,196,0.10)' },
      myCount: recentMy.length,
      partnerCount: recentPartner.length,
    });
  };

  const createRelationship = async () => {
    const code = generateCode();
    const rel = await base44.entities.Relationship.create({
      user1_email: user.email,
      invite_code: code,
      status: 'pending',
    });
    setRelationship(rel);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/unirse?code=${relationship.invite_code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/unirse?code=${relationship.invite_code}`;
    const text = encodeURIComponent(`Te invito a Naran, una app para mejorar nuestra comunicación 🍊\nÚnete aquí: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const level = metrics ? getLevel(metrics.sharedStreak) : null;

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 65%)' }}>
      <div className="flex items-center px-5 pt-10 pb-4">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Espacio de pareja</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Nosotros vs. el problema, no yo vs. tú.</p>
        </motion.div>

        {/* SIN RELACIÓN */}
        {!relationship && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl px-5 py-8 border border-border/40 shadow-sm text-center space-y-5">
            <div className="flex items-center justify-center gap-2 text-5xl">
              <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🍊</span>
              <span className="text-xl text-muted-foreground/30">+</span>
              <span>🍊</span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-base mb-1.5">Naran es mejor en equipo.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Invita a tu pareja y empiecen a construir rachas, badges y un termómetro de conexión juntos.</p>
            </div>
            {/* Preview de badges */}
            <div className="flex justify-center gap-3 py-1">
              {BADGES.map(b => (
                <div key={b.days} className="flex flex-col items-center gap-1">
                  <span className="text-2xl grayscale opacity-40">{b.emoji}</span>
                  <span className="text-[9px] text-muted-foreground/50">{b.days}d</span>
                </div>
              ))}
            </div>
            <button onClick={createRelationship}
              className="w-full h-12 rounded-2xl text-white text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#E07A5F', boxShadow: '0 6px 20px rgba(224,122,95,0.30)' }}>
              Crear invitación especial ✨
            </button>
          </motion.div>
        )}

        {/* PENDIENTE */}
        {relationship?.status === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl px-5 py-6 border border-border/40 shadow-sm space-y-4">
            {/* Animación de espera */}
            <div className="flex flex-col items-center py-2 space-y-3">
              <div className="relative flex items-center justify-center gap-3 text-4xl">
                <span>🍊</span>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-lg text-muted-foreground/50"
                >
                  ···
                </motion.div>
                <span className="text-4xl opacity-30">🍊</span>
              </div>
              <p className="font-semibold text-foreground text-sm">Esperando a tu pareja…</p>
              <p className="text-xs text-muted-foreground text-center">Comparte el código o el enlace directo</p>
            </div>

            {/* Código */}
            <div className="rounded-2xl px-4 py-4 text-center" style={{ background: 'rgba(224,122,95,0.08)' }}>
              <p className="text-xs text-muted-foreground mb-1.5">Código de conexión</p>
              <p className="text-2xl font-bold tracking-widest text-primary">{relationship.invite_code}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-2 break-all">{window.location.origin}/unirse?code={relationship.invite_code}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={copyLink}
                className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium border border-border/40 hover:bg-secondary/40 transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
              <button onClick={shareWhatsApp}
                className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium text-white"
                style={{ background: '#25D366' }}>
                <span>💬</span> WhatsApp
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVO */}
        {relationship?.status === 'active' && metrics && level && (
          <>
            {/* Header pareja */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-3xl px-5 py-5 border border-border/40 shadow-sm"
              style={{ background: metrics.thermometer.bg }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-3xl">{metrics.thermometer.emoji}</p>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/60 text-foreground/70">
                  Esta semana
                </span>
              </div>
              <p className="font-semibold text-foreground text-base mt-1">{metrics.thermometer.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Clima emocional de los últimos 7 días</p>
            </motion.div>

            {/* Racha + nivel */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl px-5 py-5 border border-border/40 shadow-sm space-y-4">

              {/* Streak */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(224,122,95,0.10)' }}>
                  <Flame className="w-6 h-6" style={{ color: '#E07A5F' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Racha compartida</p>
                  <p className="text-2xl font-bold text-foreground leading-none mt-0.5">
                    {metrics.sharedStreak} <span className="text-sm font-normal text-muted-foreground">{metrics.sharedStreak === 1 ? 'día' : 'días'}</span>
                  </p>
                </div>
                {level.current && (
                  <div className="ml-auto flex flex-col items-center">
                    <span className="text-2xl">{level.current.emoji}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{level.current.label}</span>
                  </div>
                )}
              </div>

              {/* Barra progreso hacia siguiente badge */}
              {level.next && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Próximo: {level.next.emoji} {level.next.label}</span>
                    <span>{metrics.sharedStreak}/{level.next.days}d</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#E07A5F' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (metrics.sharedStreak / level.next.days) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              )}
              {!level.next && (
                <p className="text-xs text-center text-primary font-medium">🏆 ¡Nivel máximo desbloqueado!</p>
              )}
            </motion.div>

            {/* Esta semana: yo vs pareja */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl px-5 py-5 border border-border/40 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reencuadres esta semana</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center py-4 rounded-2xl" style={{ background: 'rgba(224,122,95,0.08)' }}>
                  <p className="text-3xl font-bold text-foreground">{metrics.myCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tú</p>
                </div>
                <div className="flex items-center text-muted-foreground/30 text-xl">vs</div>
                <div className="flex-1 text-center py-4 rounded-2xl" style={{ background: 'rgba(123,156,196,0.10)' }}>
                  <p className="text-3xl font-bold text-foreground">{metrics.partnerCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{partnerName || 'Tu pareja'}</p>
                </div>
              </div>
            </motion.div>

            {/* Todos los badges */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl px-5 py-5 border border-border/40 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Badges de pareja</p>
              <div className="grid grid-cols-4 gap-3">
                {BADGES.map(b => {
                  const earned = metrics.sharedStreak >= b.days;
                  return (
                    <div key={b.days} className="flex flex-col items-center gap-1.5">
                      <motion.div
                        animate={earned ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${earned ? '' : 'grayscale opacity-30'}`}
                        style={earned ? { background: 'rgba(224,122,95,0.10)' } : { background: '#F0EDE6' }}
                      >
                        {b.emoji}
                      </motion.div>
                      <p className={`text-[10px] text-center leading-tight font-medium ${earned ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                        {b.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground/50">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}