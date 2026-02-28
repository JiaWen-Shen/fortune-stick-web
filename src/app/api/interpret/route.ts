import { NextRequest } from 'next/server';
import { getFortuneStick } from '@/lib/fortune-data';
import type { FortuneSystem } from '@/lib/fortune-types';
import { SYSTEMS } from '@/lib/systems';
import { INTERPRETATION_SYSTEM_PROMPT } from '@/lib/prompts';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:7b';

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

  const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: INTERPRETATION_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: true,
    }),
  });

  if (!ollamaRes.ok || !ollamaRes.body) {
    const err = await ollamaRes.text();
    return new Response(
      JSON.stringify({ error: `Ollama 錯誤：${err}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 將 Ollama NDJSON 串流轉換成純文字串流
  // Ollama 已將 DeepSeek R1 的推理過程放在 message.thinking 欄位
  // message.content 只包含最終答案，直接輸出即可
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const content = json.message?.content;
            if (!content) continue;
            controller.enqueue(encoder.encode(content));
          } catch {
            // 忽略非 JSON 行
          }
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
