import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'NARAN-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Espacio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      // Buscar relación activa o pendiente donde sea user1 o user2
      const rels = await base44.entities.Relationship.list('-created_date', 20);
      const mine = rels.find(r => r.user1_email === u.email || r.user2_email === u.email);
      setRelationship(mine || null);

      if (mine?.status === 'active') {
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

    // Racha compartida: días en que AMBOS registraron
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

    // Termómetro: emoción predominante última semana (solo mis logs)
    const recentMy = myLogs.filter(l => l.created_date > oneWeekAgo);
    const recentPartner = partnerLogs.filter(l => l.created_date > oneWeekAgo);
    const allRecent = [...recentMy, ...recentPartner];
    const emotionCounts = { enojo: 0, tristeza: 0, ansiedad: 0, confusion: 0 };
    allRecent.forEach(l => { if (l.emotion_label && emotionCounts[l.emotion_label] !== undefined) emotionCounts[l.emotion_label]++; });
    const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    const isCalm = dominant[1] === 0 || dominant[0] === 'confusion';

    setMetrics({
      sharedStreak,
      thermometer: isCalm
        ? { emoji: '🌿', label: 'Momento de calma', color: '#81B29A', bg: 'rgba(129,178,154,0.12)' }
        : dominant[0] === 'enojo'
        ? { emoji: '🔥', label: 'Necesitan una pausa juntos', color: '#E07A5F', bg: 'rgba(224,122,95,0.12)' }
        : { emoji: '💙', label: 'Semana de reflexión', color: '#7B9CC4', bg: 'rgba(123,156,196,0.12)' },
      myCount: recentMy.length,
      partnerCount: recentPartner.length,
      badgeUnlocked: sharedStreak >= 7,
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

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 65%)' }}>
      <div className="flex items-center px-5 pt-10 pb-6">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Espacio de pareja</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Nosotros vs. el problema, no yo vs. tú.</p>
        </motion.div>

        {/* Sin relación: invitar */}
        {!relationship && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl px-5 py-6 border border-border/40 shadow-sm text-center space-y-5">
            {/* Ilustración dos naranjas */}
            <div className="flex items-center justify-center gap-1 text-5xl">
              <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🍊</span>
              <span className="text-2xl text-muted-foreground/40">·</span>
              <span>🍊</span>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Naran es mejor en equipo.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Invita a tu persona favorita a construir un espacio de calma juntos.</p>
            </div>
            <button onClick={createRelationship}
              className="w-full h-12 rounded-2xl text-white text-sm font-semibold transition-all active:scale-95 touch-none select-none"
              style={{ background: '#E07A5F', boxShadow: '0 6px 20px rgba(224,122,95,0.30)' }}>
              Crear invitación especial ✨
            </button>
          </motion.div>
        )}

        {/* Invitación pendiente */}
        {relationship?.status === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl px-5 py-6 border border-border/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(224,122,95,0.10)' }}>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Esperando a tu pareja…</p>
                <p className="text-xs text-muted-foreground">Comparte el código o el enlace directo</p>
              </div>
            </div>
            {/* Código grande */}
            <div className="rounded-2xl px-4 py-4 text-center" style={{ background: 'rgba(224,122,95,0.08)' }}>
              <p className="text-xs text-muted-foreground mb-1">Tu código de conexión</p>
              <p className="text-2xl font-bold tracking-widest text-primary">{relationship.invite_code} 🍊</p>
              <p className="text-xs text-muted-foreground mt-2">Comparte este enlace mágico:</p>
              <p className="text-xs text-primary/70 mt-1 break-all">{window.location.origin}/unirse?code={relationship.invite_code}</p>
            </div>
            {/* Botones de compartir */}
            <div className="flex gap-2">
              <button onClick={copyLink}
                className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium border border-border/40 transition-colors hover:bg-secondary/40">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
              <button onClick={shareWhatsApp}
                className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium text-white"
                style={{ background: '#25D366' }}>
                <span className="text-base">💬</span>
                WhatsApp
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Tu pareja debe abrir el enlace y aceptar la invitación</p>
          </motion.div>
        )}

        {/* Relación activa: métricas */}
        {relationship?.status === 'active' && metrics && (
          <>
            {/* Termómetro */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-3xl px-5 py-5 border border-border/40 shadow-sm"
              style={{ background: metrics.thermometer.bg }}>
              <p className="text-2xl mb-2">{metrics.thermometer.emoji}</p>
              <p className="font-semibold text-foreground">{metrics.thermometer.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Basado en los últimos 7 días de ambos</p>
            </motion.div>

            {/* Racha compartida */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl px-5 py-5 border border-border/40 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Racha compartida</p>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-bold text-foreground">{metrics.sharedStreak}</p>
                <p className="text-sm text-muted-foreground mb-1">{metrics.sharedStreak === 1 ? 'día' : 'días'} juntos</p>
              </div>
              <p className="text-xs text-muted-foreground">Días consecutivos en que ambos practicaron</p>
            </motion.div>

            {/* Esta semana */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl px-5 py-5 border border-border/40 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Esta semana</p>
              <div className="flex gap-4">
                <div className="flex-1 text-center py-3 rounded-2xl" style={{ background: 'rgba(224,122,95,0.08)' }}>
                  <p className="text-2xl font-bold text-foreground">{metrics.myCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tú</p>
                </div>
                <div className="flex-1 text-center py-3 rounded-2xl" style={{ background: 'rgba(123,156,196,0.10)' }}>
                  <p className="text-2xl font-bold text-foreground">{metrics.partnerCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tu pareja</p>
                </div>
              </div>
            </motion.div>

            {/* Badge compartida */}
            {metrics.badgeUnlocked && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                className="rounded-3xl px-5 py-5 border text-center space-y-2"
                style={{ background: 'rgba(224,122,95,0.08)', borderColor: 'rgba(224,122,95,0.25)' }}>
                <p className="text-4xl">🏅</p>
                <p className="font-semibold text-foreground">Equipo Naranja</p>
                <p className="text-xs text-muted-foreground">7 días de racha compartida desbloqueados</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}