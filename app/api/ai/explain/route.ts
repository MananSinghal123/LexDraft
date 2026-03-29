import { streamCompletion } from "../_stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { selectedText, jurisdiction } = await req.json();

  const system = `Explain the following legal clause in 3-5 sentences as if talking to a smart businessperson who is not a lawyer. Use plain English. No jargon.
Then add "Watch out for:" with 1-2 specific bullet points about risks or ambiguities in this clause.
Jurisdiction: ${jurisdiction}.
Be conversational and direct.`;

  return streamCompletion(system, selectedText, "gpt-4o-mini", 500);
}
