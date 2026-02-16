import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getFortuneStick } from '@/lib/fortune-data';
import type { FortuneSystem } from '@/lib/fortune-types';
import { SYSTEMS } from '@/lib/systems';
import { INTERPRETATION_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { system, stickNumber, question } = body as {
    system: FortuneSystem;
    stickNumber: number;
    question: string;
  };

  if (!system || !stickNumber || !question) {
    return new Response(
      JSON.stringify({ error: '請提供完整的解籤資訊' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!SYSTEMS[system]) {
    return new Response(
      JSON.stringify({ error: '無效的籤詩系統' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stick = getFortuneStick(system, stickNumber);
  if (!stick) {
    return new Response(
      JSON.stringify({ error: '找不到該籤詩資料' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const systemName = SYSTEMS[system].name;
  const sectionsText = Object.entries(stick.sections)
    .map(([key, value]) => `【${key}】\n${value}`)
    .join('\n\n');

  const userMessage = `
籤詩系統：${systemName}
籤號：${stick.displayNumber}
${stick.rank ? `籤品：${stick.rank}` : ''}
${stick.attribute ? `屬性：${stick.attribute}` : ''}

籤詩原文：
${stick.poem.join('\n')}

${stick.story ? `典故：${stick.story}` : ''}
${stick.storyContent ? `\n${stick.storyContent}` : ''}

${sectionsText}

---
用戶的問題：${question}

請根據以上籤詩資料，針對用戶的問題提供客製化解讀。`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: INTERPRETATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    maxOutputTokens: 4000,
  });

  return result.toTextStreamResponse();
}
