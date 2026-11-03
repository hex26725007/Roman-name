const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "NO_API_KEY" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "EMPTY_INPUT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `你是一位专业的古罗马文化与姓名学顾问。用户会提供一段自我介绍，你需要根据他们的性格、兴趣、气质和使用场景，推荐3个有意义的古罗马风格名字。

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

    const model = Deno.env.get("DEEPSEEK_MODEL") || "deepseek-chat";
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请根据以下自我介绍，为我推荐3个古罗马风格名字，并以 JSON 返回：\n\n${description.trim()}` },
        ],
        temperature: 0.8,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("DeepSeek error:", response.status, errBody);
      return new Response(
        JSON.stringify({ error: "AI_ERROR", detail: response.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: "AI_EMPTY_RESPONSE" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(content);
    if (!parsed.names || !Array.isArray(parsed.names)) {
      return new Response(
        JSON.stringify({ error: "AI_INVALID_FORMAT" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
