import { motion } from 'framer-motion';

function cleanText(text = '') {
  return text
    .replace(/^el usuario (reporta sentirse|se siente)[^.]*\.\s*(su mensaje:?\s*)?/i, '')
    .replace(/^"(.+)"$/, '$1')
    .trim();
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const ACTION_LABEL = { sent: 'Enviado', saved: 'Guardado' };
const ACTION_COLOR = { sent: 'text-green-700 bg-green-50', saved: 'text-amber-700 bg-amber-50' };

export default function LogsTable({ logs }) {
  if (!logs.length) return (
    <p className="text-sm text-muted-foreground text-center py-8">No hay logs registrados.</p>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/40 bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Texto original</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Reframe</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Acción</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors"
            >
              <td className="px-4 py-3 max-w-[160px]">
                <p className="truncate text-foreground">{cleanText(log.original_text) || '—'}</p>
              </td>
              <td className="px-4 py-3 max-w-[200px] hidden sm:table-cell">
                <p className="truncate text-muted-foreground">{log.reframe_message || '—'}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${ACTION_COLOR[log.action_taken] || 'text-muted-foreground bg-secondary'}`}>
                  {ACTION_LABEL[log.action_taken] || log.action_taken || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                {formatDate(log.created_date)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}