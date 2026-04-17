import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Youtube, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const PILAR_SECTION = {
  title: 'Pilar de la Torre y la CNV',
  emoji: '🍊',
  intro: '"La CNV no es buenismo, es una forma eficaz de entenderse." — Pilar de la Torre, referente hispanohablante formada por Marshall Rosenberg.',
  items: [
    {
      type: 'video',
      title: 'Pilar de la Torre explica la CNV en 10 minutos',
      url: 'https://www.youtube.com/watch?v=ZjSuHfHF7F4',
      desc: 'Una introducción clara y cercana al método, perfecta como punto de partida.',
    },
    {
      type: 'podcast',
      title: 'Podcast Decodificados #53',
      url: 'https://open.spotify.com/show/pilar-de-la-torre',
      desc: 'Pilar profundiza en cómo aplicar la CNV en conflictos cotidianos de pareja.',
    },
    {
      type: 'quote',
      text: '"Cuando expresamos lo que necesitamos en lugar de lo que el otro hace mal, abrimos una puerta." — Pilar de la Torre',
    },
  ],
};

const SECTIONS = [
  {
    title: '¿Qué es la Comunicación No Violenta (CNV)?',
    emoji: '🕊️',
    content: [
      {
        subtitle: 'Los 4 componentes',
        text: 'La CNV, desarrollada por Marshall Rosenberg, propone expresar y escuchar con cuatro pasos:',
        steps: [
          { label: 'Observación', desc: 'Describe el hecho sin juzgar. "Cuando llego a casa y hay platos sucios en la pila..."' },
          { label: 'Sentimiento', desc: 'Nombra cómo te sientes. "...me siento agobiado..."' },
          { label: 'Necesidad', desc: 'Expresa la necesidad detrás. "...porque necesito orden para descansar."' },
          { label: 'Petición', desc: 'Pide algo concreto y posible. "¿Podemos limpiar juntos antes de cenar?"' },
        ],
      },
      {
        subtitle: 'En lugar de... prueba...',
        examples: [
          { before: '"Eres un desordenado."', after: '"Me siento agobiado cuando hay ropa en el suelo. Necesito que recojamos juntos."' },
          { before: '"Nunca me escuchas."', after: '"Cuando interrumpes, me siento ignorado. Necesito que me escuches hasta el final."' },
          { before: '"Siempre llegas tarde."', after: '"Cuando espero más de 20 minutos, me siento ansioso. ¿Podemos acordar un aviso previo?"' },
        ],
      },
    ],
  },
  {
    title: 'Los 4 Jinetes del Apocalipsis',
    emoji: '⚠️',
    intro: 'El Dr. John Gottman identificó estos 4 patrones como los mejores predictores de ruptura. La buena noticia: cada uno tiene un antídoto.',
    jinetes: [
      {
        nombre: 'Crítica',
        descripcion: 'Atacar el carácter de la persona, no el comportamiento.',
        ejemplo: '"Eres tan irresponsable."',
        antidoto: 'Inicio suave: habla de TU sentimiento y necesidad, no de su defecto.',
        antiejemplo: '"Me siento frustrado cuando los pagos llegan tarde. ¿Podemos organizarnos?"',
        color: '#E07A5F',
      },
      {
        nombre: 'Desprecio',
        descripcion: 'Sarcasmo, burlas, poner los ojos en blanco. Es el más dañino.',
        ejemplo: '"¿En serio? Qué nivel..."',
        antidoto: 'Cultura de apreciación: busca activamente lo que valoras del otro.',
        antiejemplo: '"Aprecio que lo intentaras. Me gustaría que la próxima vez..."',
        color: '#C9614A',
      },
      {
        nombre: 'Defensividad',
        descripcion: 'Responder a una queja con otra queja. Nadie se siente escuchado.',
        ejemplo: '"Pues tú tampoco..."',
        antidoto: 'Asumir un 5% de responsabilidad. Solo uno.',
        antiejemplo: '"Tienes razón en que podría haber avisado. Lo haré diferente."',
        color: '#D4865A',
      },
      {
        nombre: 'Evasión',
        descripcion: 'Desconectarse emocionalmente, ignorar, salir de la habitación.',
        ejemplo: 'Silencio, monosílabos, mirar el móvil.',
        antidoto: 'Pedir una pausa de 20 minutos. Volver cuando el sistema nervioso se calme.',
        antiejemplo: '"Necesito 20 minutos para calmarme. Vuelvo y seguimos."',
        color: '#B8735A',
      },
    ],
  },
];

export default function Recursos() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-medium text-foreground mr-12">
          Biblioteca
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-8">

        {/* Pilar de la Torre */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden border border-border"
          style={{ background: 'rgba(224,122,95,0.06)' }}
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{PILAR_SECTION.emoji}</span>
              <h2 className="text-base font-semibold text-foreground">{PILAR_SECTION.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">{PILAR_SECTION.intro}</p>

            <div className="space-y-3">
              {PILAR_SECTION.items.map((item, i) => (
                <div key={i}>
                  {item.type === 'video' && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-2xl bg-white border border-border/40 px-4 py-3 hover:bg-secondary/30 transition-colors">
                      <Youtube className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 ml-auto shrink-0" />
                    </a>
                  )}
                  {item.type === 'podcast' && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-2xl bg-white border border-border/40 px-4 py-3 hover:bg-secondary/30 transition-colors">
                      <Mic className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 ml-auto shrink-0" />
                    </a>
                  )}
                  {item.type === 'quote' && (
                    <div className="rounded-2xl px-4 py-3 border border-primary/20"
                      style={{ background: 'rgba(224,122,95,0.08)' }}>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">{item.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {SECTIONS.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{section.emoji}</span>
              <h2 className="text-base font-semibold text-foreground leading-snug">{section.title}</h2>
            </div>

            {section.intro && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{section.intro}</p>
            )}

            {/* CNV sections */}
            {section.content?.map((block, bi) => (
              <div key={bi} className="mb-5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">{block.subtitle}</p>
                {block.text && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{block.text}</p>}
                {block.steps && (
                  <div className="space-y-2">
                    {block.steps.map((s, i) => (
                      <div key={i} className="flex gap-3 rounded-xl px-4 py-3" style={{ background: '#F3F1EB' }}>
                        <span className="text-xs font-bold text-primary mt-0.5 shrink-0 w-5">{i + 1}.</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {block.examples && (
                  <div className="space-y-3">
                    {block.examples.map((ex, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-border">
                        <div className="px-4 py-2.5 bg-red-50">
                          <p className="text-xs text-red-500 font-medium mb-0.5">En lugar de:</p>
                          <p className="text-sm text-red-700 italic">{ex.before}</p>
                        </div>
                        <div className="px-4 py-2.5" style={{ background: '#F0FAF4' }}>
                          <p className="text-xs text-green-600 font-medium mb-0.5">Prueba:</p>
                          <p className="text-sm text-green-800 italic">{ex.after}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Jinetes */}
            {section.jinetes?.map((j, ji) => (
              <div key={ji} className="mb-4 rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: j.color + '18' }}>
                  <span className="text-sm font-bold" style={{ color: j.color }}>{j.nombre}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{j.descripcion}</p>
                  <div className="rounded-lg px-3 py-2 bg-red-50">
                    <p className="text-xs text-red-400 font-medium mb-0.5">Ejemplo dañino:</p>
                    <p className="text-xs text-red-600 italic">{j.ejemplo}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: '#F0FAF4' }}>
                    <p className="text-xs text-green-600 font-medium mb-0.5">Antídoto — {j.antidoto}</p>
                    <p className="text-xs text-green-700 italic">{j.antiejemplo}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}