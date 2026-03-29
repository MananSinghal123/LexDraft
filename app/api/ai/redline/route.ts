import { streamCompletion } from "../_stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { clauseText, ourParty, jurisdiction } = await req.json();

  const system = `You are a ${jurisdiction} contracts attorney. Rewrite the following clause to be:
- Clearer and less ambiguous
- More protective of ${ourParty}  
- Legally enforceable in ${jurisdiction}

Return ONLY the rewritten clause text. No explanation. No preamble. Preserve any clause number or heading if present.`;

  return streamCompletion(system, clauseText, "gpt-4o", 1000);
}
