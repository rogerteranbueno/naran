import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function StreakCounter() {
  const [streak, setStreak] = useState(null);
  const [practicedToday, setPracticedToday] = useState(false);

  useEffect(() => {
    base44.entities.ConflictLog.list('-created_date', 60).then(logs => {
      if (logs.length === 0) { setStreak(0); return; }

      const todayStr = new Date().toDateString();
      const todayLog = logs.find(l => new Date(l.created_date).toDateString() === todayStr);
      setPracticedToday(!!todayLog);

      // Count consecutive days
      let count = 0;
      const checked = new Set();
      for (const log of logs) {
        const d = new Date(log.created_date);
        const ds = d.toDateString();
        if (checked.has(ds)) continue;
        checked.add(ds);
        const expected = new Date();
        expected.setDate(expected.getDate() - count);
        if (d.toDateString() === expected.toDateString()) {
          count++;
        } else {
          break;
        }
      }
      setStreak(count);
    }).catch(() => setStreak(0));
  }, []);

  if (streak === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: streak > 0 ? 'rgba(224,122,95,0.12)' : 'rgba(0,0,0,0.04)' }}
    >
      {streak > 0 ? (
        <>
          <span className="text-sm">🔥</span>
          <span className="text-xs font-semibold text-foreground">{streak} {streak === 1 ? 'día' : 'días'}</span>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Hoy aún no has practicado</span>
      )}
    </motion.div>
  );
}