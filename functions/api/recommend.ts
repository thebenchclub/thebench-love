interface Env {
  ANTHROPIC_API_KEY?: string;
}

const SYSTEM_PROMPT = `You are The Bench Club advisor. The user will describe what they need help with. Based on their input, recommend exactly ONE of these four products:

1. HerBench — For women juggling home and work. Warm, calm, emotionally intelligent support.
2. Realtor Bench — For real estate agents. Sharp, confident, revenue-aware support for leads, follow-up, and closings.
3. Sports Bench — For sports team operations. Steady, reliable, organized support.
4. SMB Bench — For small business owners who need a real right hand. Practical, strategic, quietly powerful.

Reply in 2-3 sentences max. First sentence: acknowledge their specific situation. Second sentence: name the recommended Bench and why it fits. Keep the tone warm, direct, and confident. Do not use bullet points or lists.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: { prompt?: string };

  try {
    body = await context.request.json<{ prompt?: string }>();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const prompt = body.prompt;

  if (!prompt || prompt.trim().length === 0) {
    return json({ error: "Prompt is required" }, 400);
  }

  const userInput = prompt.trim().slice(0, 500);
  const apiKey = context.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return json({ recommendation: fallbackRecommendation(userInput), source: "curated" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userInput }],
      }),
    });

    if (!response.ok) {
      return json({ recommendation: fallbackRecommendation(userInput), source: "curated" });
    }

    const data: any = await response.json();
    const text =
      data.content?.[0]?.text ??
      "Something went wrong. Please try again.";

    return json({ recommendation: text, source: "anthropic" });
  } catch {
    return json({ recommendation: fallbackRecommendation(userInput), source: "curated" });
  }
};

function fallbackRecommendation(input: string) {
  const text = input.toLowerCase();

  if (/(realtor|real estate|listing|buyer|seller|lead|closing|open house|client)/.test(text)) {
    return "You are carrying timing, follow-up, and client trust all at once. Realtor Bench fits best because it is built for leads, listings, closings, and the communication that keeps deals moving.";
  }

  if (/(team|coach|sport|league|athlete|parent|schedule|roster|tournament)/.test(text)) {
    return "You need a steadier way to keep people, schedules, and details moving together. Sports Bench fits best because it is built for the operational load behind teams and programs.";
  }

  if (/(home|kids|family|house|work and home|overwhelmed|mental load|woman|women|mom)/.test(text)) {
    return "You are holding the invisible work that sits between life, family, and business. HerBench fits best because it is designed for warm, practical support when home and work keep bleeding together.";
  }

  return "You need a real right hand, not another tool to babysit. SMB Bench fits best because it is built for small business owners who need practical support with decisions, admin, follow-up, and momentum.";
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
