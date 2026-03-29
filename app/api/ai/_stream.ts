import { getOpenAI } from "@/lib/openai";

export async function streamCompletion(
  systemPrompt: string,
  userContent: string,
  model: "gpt-4o" | "gpt-4o-mini" = "gpt-4o",
  maxTokens = 3000,
): Promise<Response> {
  const stream = await getOpenAI().chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
