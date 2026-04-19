import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, History, Heart, Users, ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    icon: <Mic className="w-5 h-5" />,
    title: 'Habla o escribe',
    desc: 'Captura lo que sientes en el momento, con voz o texto.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Reencuadre inteligente',
    desc: 'Naran transforma tus palabras en un mensaje empático listo para enviar.',
  },
  {
    icon: <History className="w-5 h-5" />,
    title: 'Historial de crecimiento',
    desc: 'Ve tu progreso, tus rachas y cómo evolucionas día a día.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Espacio de pareja',
    desc: 'Conecta con tu pareja y construyan juntos una comunicación más sana.',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Basado en ciencia',
    desc: 'Método Gottman + Comunicación No Violenta en cada sugerencia.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed);
  }, []);

  const handleLogin = () => {
    if (authed) navigate('/home');
    else base44.auth.redirectToLogin('/home');
  };
  const handleDemo = () => navigate('/demo');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFBF7' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <span className="text-xl font-semibold tracking-tight text-foreground">🍊 naran</span>
        <button
          onClick={handleLogin}
          className="text-sm font-medium px-4 py-2 rounded-xl border border-border/60 hover:bg-secondary/60 transition-colors"
        >
          {authed ? 'Ir a la app →' : 'Iniciar sesión'}
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-10 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8"
            style={{ background: 'rgba(224,122,95,0.12)' }}
          >
            🍊
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Habla desde el corazón,<br />no desde el enojo.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-sm mx-auto">
            Naran te ayuda a transformar tus reacciones en mensajes de conexión,
            usando inteligencia artificial y psicología de pareja.
          </p>

          <div className="flex flex-col gap-3 justify-center w-full max-w-xs mx-auto">
            <button
              onClick={handleLogin}
              className="h-14 px-8 rounded-2xl text-white text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
            >
              {authed ? 'Ir a mi app →' : 'Crear cuenta gratis'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDemo}
              className="h-11 px-8 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver demo sin registro →
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">Sin tarjeta de crédito · Gratis para empezar</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-start gap-4 bg-white rounded-2xl px-5 py-4 border border-border/40 shadow-sm"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(224,122,95,0.10)', color: '#E07A5F' }}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 text-center"
        >
          <button
            onClick={handleLogin}
            className="w-full h-14 rounded-2xl text-white text-base font-semibold transition-all active:scale-95"
            style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.30)' }}
          >
            {authed ? 'Ir a mi app 🍊' : 'Crear mi cuenta gratis 🍊'}
          </button>
          <p className="text-xs text-muted-foreground/50 mt-4">
            © 2025 Naran · Comunicación de pareja con IA
          </p>
        </motion.div>
      </section>
    </div>
  );
}