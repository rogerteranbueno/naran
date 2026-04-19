// Demo mode utilities — ephemeral local session, no Base44 writes

export const DEMO_KEY = 'naran_demo_mode';

export const DEMO_LOGS = [
  {
    id: 'demo-1',
    original_text: 'Me sentí ignorado durante la cena, como si no importara.',
    cognitive_note: 'Inicio duro con generalización implícita',
    reframe_message: 'Cuando cenamos en silencio siento que no me ves. Necesito saber que sigues aquí conmigo.',
    action_taken: 'sent',
    status: 'resolved',
    emotion_label: 'tristeza',
    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    original_text: 'Discutimos por dinero otra vez. Siempre lo mismo.',
    cognitive_note: 'Generalización + defensividad',
    reframe_message: 'Me angustia cuando hablamos de dinero y no llegamos a un acuerdo. ¿Podemos buscar un momento tranquilo para planificarlo juntos?',
    action_taken: 'saved',
    status: 'pending',
    emotion_label: 'ansiedad',
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    original_text: 'No me gustó cómo habló de mi familia delante de todos.',
    cognitive_note: 'Crítica + necesidad de respeto no expresada',
    reframe_message: 'Cuando se habla de mi familia de esa manera en público me siento herido. Para mí es importante que nos cuidemos mutuamente.',
    action_taken: 'saved',
    status: 'pending',
    emotion_label: 'enojo',
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    original_text: 'Se fue a dormir sin decirme nada.',
    cognitive_note: 'Evasión detectada — mensaje corto, tensión no expresada',
    reframe_message: 'Cuando te vas sin decir nada me quedo con incertidumbre. ¿Hay algo que quieras contarme cuando estés listo?',
    action_taken: 'sent',
    status: 'resolved',
    emotion_label: 'confusion',
    created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_USER = {
  id: 'demo-user',
  full_name: 'Usuario Invitado',
  email: 'demo@naran.app',
  role: 'user',
};

export function isDemoMode() {
  return localStorage.getItem(DEMO_KEY) === 'true';
}

export function startDemo() {
  localStorage.setItem(DEMO_KEY, 'true');
}

export function endDemo() {
  localStorage.removeItem(DEMO_KEY);
}