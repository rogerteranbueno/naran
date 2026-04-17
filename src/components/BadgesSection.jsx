import React from 'react';
import { motion } from 'framer-motion';

const BADGES = [
  {
    id: 'primera_pausa',
    emoji: '🌱',
    title: 'Primera Pausa',
    desc: 'Usaste Naran por primera vez',
    condition: (logs, streak) => logs.length >= 1,
  },
  {
    id: 'principiante_cnv',
    emoji: '🕊️',
    title: 'Principiante CNV',
    desc: 'Guardaste 5 momentos',
    condition: (logs) => logs.length >= 5,
  },
  {
    id: 'domador_jinetes',
    emoji: '⚠️',
    title: 'Domador de Jinetes',
    desc: 'Guardaste 15 momentos',
    condition: (logs) => logs.length >= 15,
  },
  {
    id: 'racha_fuego',
    emoji: '🔥',
    title: 'Racha de Fuego',
    desc: '3 días consecutivos practicando',
    condition: (logs, streak) => streak >= 3,
  },
  {
    id: 'semana_completa',
    emoji: '🏆',
    title: 'Semana Completa',
    desc: '7 días consecutivos practicando',
    condition: (logs, streak) => streak >= 7,
  },
  {
    id: 'embajador_calma',
    emoji: '🍊',
    title: 'Embajador de la Calma',
    desc: 'Guardaste 30 momentos',
    condition: (logs) => logs.length >= 30,
  },
];

export default function BadgesSection({ logs, streak }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Insignias</p>
      <div className="grid grid-cols-3 gap-2">
        {BADGES.map((badge, i) => {
          const earned = badge.condition(logs, streak);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 border transition-all"
              style={{
                background: earned ? 'rgba(224,122,95,0.08)' : 'rgba(0,0,0,0.02)',
                borderColor: earned ? 'rgba(224,122,95,0.25)' : 'rgba(0,0,0,0.06)',
                opacity: earned ? 1 : 0.45,
              }}
            >
              <span className="text-2xl" style={{ filter: earned ? 'none' : 'grayscale(1)' }}>
                {badge.emoji}
              </span>
              <p className="text-[10px] font-semibold text-foreground text-center leading-tight">{badge.title}</p>
              <p className="text-[9px] text-muted-foreground text-center leading-tight">{badge.desc}</p>
              {earned && (
                <span className="text-[8px] font-bold text-primary uppercase tracking-wide">Obtenida</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}