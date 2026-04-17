import { base44 } from '@/api/base44Client';

export async function humanizeDiagnosis(technicalNote) {
  if (!technicalNote) return null;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Eres un terapeuta de pareja experto en Gottman y CNV. Tu trabajo es traducir un diagnóstico técnico de IA en una frase validante y educativa para una persona en un momento de vulnerabilidad. Usa un lenguaje cotidiano, empático y sin jerga académica. Máximo 15 palabras.

Diagnóstico: "${technicalNote}"

Traduce esto a una frase empática que valide cómo se siente la persona.`,
    response_json_schema: {
      type: 'object',
      properties: {
        humanized: { type: 'string' },
      },
    },
    model: 'gemini_3_flash',
  });

  return result.humanized;
}