import type { RomanName } from '../types';

export const ROMAN_NAME_SYSTEM_PROMPT = `你是一位专业的古罗马文化与姓名学顾问。用户会提供一段自我介绍，你需要根据他们的性格、兴趣、气质和使用场景，推荐3个有意义的古罗马风格名字。

严格规则：
1. 优先使用有真实文化依据的古罗马姓名元素（praenomen、nomen、cognomen）。
2. 如果名字是创作名而非史实姓名，必须在note字段中注明"古罗马风格创作名"。
3. 不虚构历史事实，不暗示用户拥有罗马血统或身份。
4. 不使用知名皇帝、政治人物或争议人物的完整姓名（如Julius Caesar、Augustus等）。
5. 每个推荐理由必须引用用户输入中的至少两项具体特点。
6. 气质标签每个名字正好3个，用中文，简洁有力。
7. 名字含义要有文化深度，联系罗马历史、神话或文化。

必须输出严格的JSON格式，不要任何其他文字：
{
  "names": [
    {
      "name": "罗马名（拉丁文）",
      "cn": "中文音译",
      "pronunciation": "简单读法（如：卡西乌斯，读作 kǎ-xī-wū-sī）",
      "meaning": "名字含义及文化联想（2-3句话）",
      "tags": ["标签1", "标签2", "标签3"],
      "reason": "为什么这个名字适合你（引用用户至少两项具体特点）",
      "note": "史实依据或'古罗马风格创作名'"
    }
  ]
}`;

export type GenerateFailure = {
  ok: false;
  status: number;
  error: string;
  detail?: string | number;
};

export type GenerateSuccess = {
  ok: true;
  names: RomanName[];
};

export async function generateRomanNames(options: {
  apiKey: string;
  description: string;
  model?: string;
  apiUrl?: string;
}): Promise<GenerateSuccess | GenerateFailure> {
  const description = options.description.trim();
  if (!description) {
    return { ok: false, status: 400, error: 'EMPTY_INPUT' };
  }

  const apiUrl = options.apiUrl ?? 'https://api.deepseek.com/chat/completions';
  const model = options.model ?? 'deepseek-chat';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: ROMAN_NAME_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `请根据以下自我介绍，为我推荐3个古罗马风格名字，并以 JSON 返回：\n\n${description}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('DeepSeek error:', response.status, errBody);
    return {
      ok: false,
      status: 502,
      error: 'AI_ERROR',
      detail: response.status,
    };
  }

  const aiData = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = aiData.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, status: 502, error: 'AI_EMPTY_RESPONSE' };
  }

  let parsed: { names?: RomanName[] };
  try {
    parsed = extractJson(content);
  } catch {
    return { ok: false, status: 502, error: 'AI_INVALID_FORMAT' };
  }

  if (!parsed.names || !Array.isArray(parsed.names)) {
    return { ok: false, status: 502, error: 'AI_INVALID_FORMAT' };
  }

  return { ok: true, names: parsed.names };
}

function extractJson(content: string): { names?: RomanName[] } {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    return JSON.parse(match[0]);
  }
}
