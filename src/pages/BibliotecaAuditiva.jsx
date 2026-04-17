import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const RECURSOS = [
  {
    id: 'cnv-pilar-intro',
    category: 'Mini-lección CNV',
    title: 'La CNV en 10 minutos',
    author: 'Pilar de la Torre',
    duration: '10 min',
    emoji: '🕊️',
    color: 'rgba(224,122,95,0.10)',
    url: 'https://www.youtube.com/watch?v=ZjSuHfHF7F4',
    desc: 'Introducción clara al método por la principal referente hispanohablante.',
  },
  {
    id: 'meditacion-pausa',
    category: 'Meditación',
    title: 'Pausa de 3 minutos',
    author: 'Meditación guiada',
    duration: '3 min',
    emoji: '🌬️',
    color: 'rgba(129,178,154,0.12)',
    url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    desc: 'Respiración consciente para calmar la reactividad antes de una conversación difícil.',
  },
  {
    id: 'cnv-peticion',
    category: 'Mini-lección CNV',
    title: 'Cómo hacer una petición sin exigir',
    author: 'Marshall Rosenberg',
    duration: '8 min',
    emoji: '🤲',
    color: 'rgba(224,122,95,0.08)',
    url: 'https://www.youtube.com/watch?v=l7TONauJGfc',
    desc: 'La diferencia entre pedir y exigir, con ejemplos reales.',
  },
  {
    id: 'respiracion-pareja',
    category: 'Meditación',
    title: 'Respiración consciente para parejas',
    author: 'Meditación guiada',
    duration: '5 min',
    emoji: '💙',
    color: 'rgba(123,156,196,0.10)',
    url: 'https://www.youtube.com/watch?v=DbDoBzGY3vo',
    desc: 'Regula el sistema nervioso antes de una conversación importante.',
  },
  {
    id: 'gottman-4jinetes',
    category: 'Mini-lección CNV',
    title: 'Los 4 Jinetes explicados',
    author: 'Método Gottman',
    duration: '12 min',
    emoji: '⚠️',
    color: 'rgba(201,97,74,0.08)',
    url: 'https://www.youtube.com/watch?v=1o30Ps-_8is',
    desc: 'Entiende los 4 patrones que predicen conflicto y sus antídotos.',
  },
];

const CATEGORIES = ['Todos', 'Meditación', 'Mini-lección CNV'];

export default function BibliotecaAuditiva() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.favorite_audios?.length) {
        setFavorites(u.favorite_audios);
      } else {
        const saved = localStorage.getItem('naran_audio_favs');
        if (saved) setFavorites(JSON.parse(saved));
      }
    }).catch(() => {
      const saved = localStorage.getItem('naran_audio_favs');
      if (saved) setFavorites(JSON.parse(saved));
    });
  }, []);

  const toggleFavorite = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('naran_audio_favs', JSON.stringify(next));
    base44.auth.updateMe({ favorite_audios: next }).catch(() => {});
  };

  const filtered = activeFilter === 'Todos' ? RECURSOS : RECURSOS.filter(a => a.category === activeFilter);
  const favRecursos = RECURSOS.filter(a => favorites.includes(a.id));

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 65%)' }}>
      <div className="flex items-center gap-3 px-5 pt-8 pb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-medium text-foreground mr-12">Biblioteca</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-6">
        {/* Filtros */}
        <div className="flex gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeFilter === cat
                ? { background: '#E07A5F', color: '#fff' }
                : { background: 'rgba(0,0,0,0.05)', color: '#666' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Favoritos */}
        {favRecursos.length > 0 && activeFilter === 'Todos' && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Mis favoritos</p>
            <div className="space-y-3">
              {favRecursos.map((r, i) => (
                <ResourceCard key={r.id} resource={r} isFav onFav={toggleFavorite} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Lista */}
        <div>
          {activeFilter !== 'Todos' && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">{activeFilter}</p>
          )}
          {activeFilter === 'Todos' && favRecursos.length > 0 && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Todos</p>
          )}
          <div className="space-y-3">
            {filtered.map((r, i) => (
              <ResourceCard key={r.id} resource={r} isFav={favorites.includes(r.id)} onFav={toggleFavorite} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, isFav, onFav, index }) {
  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl px-4 py-4 border border-border/40 shadow-sm flex items-center gap-4 hover:bg-secondary/20 transition-colors"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: resource.color }}>
        {resource.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{resource.category}</p>
        <p className="text-sm font-semibold text-foreground leading-tight">{resource.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Youtube className="w-3 h-3 text-red-400" />
          <p className="text-xs text-muted-foreground">{resource.author} · {resource.duration}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => onFav(e, resource.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-secondary/50"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`} />
        </button>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/40">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.a>
  );
}