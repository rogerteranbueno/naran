import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function Unirse() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | joining | success | error | already
  const [code, setCode] = useState('');
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code');
    if (c) {
      setCode(c);
      joinWithCode(c);
    } else {
      setStatus('manual');
    }
  }, []);

  const joinWithCode = async (c) => {
    setStatus('joining');
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    // Verificar si ya tiene una relación
    const myRels = await base44.entities.Relationship.list('-created_date', 20);
    const mine = myRels.find(r => r.user1_email === user.email || r.user2_email === user.email);
    if (mine?.status === 'active') { setStatus('already'); return; }

    // Buscar la relación por código
    const rels = await base44.entities.Relationship.filter({ invite_code: c, status: 'pending' }, '-created_date', 1);
    const rel = rels[0];
    if (!rel) { setStatus('error'); return; }
    if (rel.user1_email === user.email) { setStatus('error'); return; } // no puede unirse a sí mismo

    await base44.entities.Relationship.update(rel.id, { user2_email: user.email, status: 'active' });
    setStatus('success');
    setTimeout(() => navigate('/espacio'), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(224,122,95,0.15) 0%, #FDFBF7 70%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-6">
        <div className="text-6xl mb-2">🍊</div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Espacio de pareja</h1>

        {(status === 'loading' || status === 'joining') && (
          <div className="space-y-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Conectando…</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-foreground">¡Conexión exitosa!</p>
            <p className="text-sm text-muted-foreground">Ahora estáis conectados. Redirigiendo…</p>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Código no válido o ya usado. Pide un nuevo código a tu pareja.</p>
            <button onClick={() => navigate('/home')} className="w-full h-12 rounded-2xl text-white text-sm font-medium" style={{ background: '#E07A5F' }}>
              Volver al inicio
            </button>
          </div>
        )}

        {status === 'already' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Ya tienes una pareja vinculada.</p>
            <button onClick={() => navigate('/espacio')} className="w-full h-12 rounded-2xl text-white text-sm font-medium" style={{ background: '#E07A5F' }}>
              Ver mi espacio
            </button>
          </div>
        )}

        {status === 'manual' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Ingresa el código que te compartió tu pareja</p>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              placeholder="NR-XXXX"
              className="w-full text-center text-lg font-bold tracking-widest rounded-2xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              disabled={manualCode.length < 4}
              onClick={() => joinWithCode(manualCode)}
              className="w-full h-12 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
              style={{ background: '#E07A5F' }}>
              Unirme
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}