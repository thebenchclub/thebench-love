interface Env {
  ANTHROPIC_API_KEY: string;
}

const SYSTEM_PROMPT = `You are The Bench Club advisor. The user will describe what they need help with. Based on their input, recommend exactly ONE of these four products:

1. HerBench — For women juggling home and work. Warm, calm, emotionally intelligent support.
2. Realtor Bench — For real estate agents. Sharp, confident, revenue-aware support for leads, follow-up, and closings.
3. Sports Bench — For sports team operations. Steady, reliable, organized support.
4. SMB Bench — For small business owners who need a real right hand. Practical, strategic, quietly powerful.

Reply in 2-3 sentences max. First sentence: acknowledge their specific situation. Second sentence: name the recommended Bench and why it fits. Keep the tone warm, direct, and confident. Do not use bullet points or lists.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { prompt } = await context.request.json<{ prompt: string }>();

  if (!prompt || prompt.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Prompt is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const userInput = prompt.trim().slice(0, 500);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": context.env.ANTHROPIC_API_KEY,
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
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data: any = await response.json();
    const text =
      data.content?.[0]?.text ??
      "Something went wrong. Please try again.";

    return new Response(JSON.stringify({ recommendation: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
