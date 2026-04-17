import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILDORAS = [
  "🍊 'Cuando expresamos lo que necesitamos en lugar de lo que el otro hace mal, abrimos una puerta.' — Pilar de la Torre",
  "🕊️ CNV: Observación → Sentimiento → Necesidad → Petición. Cuatro pasos que cambian conversaciones.",
  "🔥 El antídoto a la Crítica es el Inicio Suave. Empieza con 'Yo siento...' en lugar de 'Tú siempre...'",
  "🌊 El antídoto al Desprecio es la Apreciación. ¿Qué valoras hoy de tu pareja?",
  "⚠️ Cuando sientas que el sistema nervioso se acelera, pide una pausa de 20 minutos. Vuelve cuando estés calm@.",
  "🌿 'La CNV no es buenismo, es una forma eficaz de entenderse.' — Pilar de la Torre",
  "❤️ Ejercicio de hoy: Dile a tu pareja una cosa concreta que aprecias de ella sin esperar nada a cambio.",
  "🏔️ El 69% de los conflictos de pareja son perpetuos, según Gottman. No se trata de ganar, sino de dialogar.",
  "🌸 Una petición CNV es concreta y posible: '¿Podemos hablar esta noche 10 minutos sin móvil?'",
  "🌙 Antes de dormir: ¿Hubo un momento hoy en que pudiste haber respondido con más calma? Eso es aprendizaje.",
  "💭 La defensividad es decirle al otro que su percepción está equivocada. Prueba a asumir un 5% de responsabilidad.",
  "🍊 Ritual de conexión: Una pregunta profunda cada día. '¿Qué fue lo más difícil de hoy para ti?'",
  "🕊️ Diferencia clave: Sentimiento vs Pseudo-sentimiento. 'Me siento ignorad@' (juicio) vs 'Me siento sol@' (sentimiento real).",
  "🔥 Practica hoy en Naran. Cada conversación difícil que entrenas es una que no tendrás que improvisar.",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function runs as a scheduled automation — no user auth needed.
    // Get all users who have opted in to pildoras
    const users = await base44.asServiceRole.entities.User.list();
    const optedIn = users.filter(u => u.pildoras_enabled);

    const today = new Date();
    const dayIndex = today.getDate() % PILDORAS.length;
    const pildora = PILDORAS[dayIndex];

    let sent = 0;
    for (const u of optedIn) {
      if (!u.email) continue;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: u.email,
        subject: '🍊 Tu Píldora de Calma de hoy',
        body: `
Hola${u.full_name ? ' ' + u.full_name.split(' ')[0] : ''},

${pildora}

---
Abre Naran para practicar → 

Con calma,
El equipo de Naran

---
Para dejar de recibir estas píldoras, ve a tu perfil en Naran y desactiva las Píldoras de Calma.
        `.trim(),
      });
      sent++;
    }

    return Response.json({ ok: true, sent, pildora });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});