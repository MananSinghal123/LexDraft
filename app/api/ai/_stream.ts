import { getGoogleGenerativeAI } from "@/lib/gemini";

/** Maps legacy OpenAI-style names to Gemini model IDs. */
const MODEL_ALIASES: Record<string, string> = {
  "gpt-4o": "gemini-2.0-flash",
  "gpt-4o-mini": "gemini-1.5-flash-8b",
};

export async function streamCompletion(
  systemPrompt: string,
  userContent: string,
  model: "gpt-4o" | "gpt-4o-mini" = "gpt-4o",
  maxTokens = 3000,
): Promise<Response> {
  const genAI = getGoogleGenerativeAI();
  const modelId = MODEL_ALIASES[model] ?? model;
  const geminiModel = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const result = await geminiModel.generateContentStream(userContent);

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
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
