import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isDemoMode } from '@/lib/demoMode';

export default function StreakRing() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (isDemoMode()) { setStreak(3); return; }
    base44.entities.ConflictLog.list('-created_date', 60).then(logs => {
      if (logs.length === 0) { setStreak(0); return; }
      let count = 0;
      const checked = new Set();
      for (const log of logs) {
        const ds = new Date(log.created_date).toDateString();
        if (checked.has(ds)) continue;
        checked.add(ds);
        const expected = new Date();
        expected.setDate(expected.getDate() - count);
        if (new Date(log.created_date).toDateString() === expected.toDateString()) count++;
        else break;
      }
      setStreak(count);
    }).catch(() => setStreak(0));
  }, []);

  if (streak === null) return <div className="w-14 h-14" />;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(streak / 7, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3.5" />
        <motion.circle
          cx="24" cy="24" r={radius} fill="none"
          stroke={streak > 0 ? '#E07A5F' : '#D1CCC4'}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="flex flex-col items-center leading-none">
        {streak > 0
          ? <>
              <Flame className="w-3.5 h-3.5" style={{ color: '#E07A5F' }} />
              <span className="text-sm font-bold text-foreground">{streak}</span>
            </>
          : <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">hoy no</span>
        }
      </div>
    </div>
  );
}