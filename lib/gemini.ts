import { GoogleGenerativeAI } from "@google/generative-ai";

let instance: GoogleGenerativeAI | null = null;

export function getGoogleGenerativeAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!instance) {
    instance = new GoogleGenerativeAI(key);
  }
  return instance;
}
