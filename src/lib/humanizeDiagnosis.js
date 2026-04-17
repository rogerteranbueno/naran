import { base44 } from '@/api/base44Client';

export async function humanizeDiagnosis(technicalNote) {
  if (!technicalNote) return null;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: technicalNote,
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