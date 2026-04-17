import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EMOTION_MAP = {
  enojo: { label: 'Enojo', color: '#E07A5F' },
  tristeza: { label: 'Tristeza', color: '#7B9CC4' },
  ansiedad: { label: 'Ansiedad', color: '#C4A87B' },
  confusion: { label: 'Calma', color: '#81B29A' },
};

export default function WeeklyChart({ logs }) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = logs.filter(l => new Date(l.created_date).getTime() > oneWeekAgo);

  if (recent.length === 0) return null;

  const counts = { enojo: 0, tristeza: 0, ansiedad: 0, confusion: 0 };
  recent.forEach(l => {
    if (l.emotion_label && counts[l.emotion_label] !== undefined) {
      counts[l.emotion_label]++;
    }
  });

  const data = Object.entries(EMOTION_MAP).map(([key, { label, color }]) => ({
    label,
    value: counts[key],
    color,
  })).filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-border/40 mb-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Emociones esta semana</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}