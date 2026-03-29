import { streamCompletion } from "../_stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { documentText, theirParty, jurisdiction } = await req.json();

  const system = `You are a sharp, adversarial ${jurisdiction} attorney representing ${theirParty}. You have just received this contract from opposing counsel.

Write a memo TO your client as their lawyer reviewing this contract. Be critical and adversarial.

Your memo must cover:
1. Every clause that disadvantages ${theirParty}
2. Missing protections your client should demand
3. Ambiguous language that could be interpreted against your client  
4. Specific clauses to strike, modify, or add
5. Overall negotiating posture recommendation

Format as a professional legal memo with numbered sections.
Do not be balanced. You represent ${theirParty} exclusively.`;

  return streamCompletion(system, documentText, "gpt-4o", 4000);
}
