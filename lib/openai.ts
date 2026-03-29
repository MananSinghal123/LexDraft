import OpenAI from "openai";

let instance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!instance) {
    instance = new OpenAI({ apiKey: key });
  }
  return instance;
}
