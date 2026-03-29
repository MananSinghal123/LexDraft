import { streamCompletion } from "../_stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, docType, jurisdiction, ourParty } = await req.json();

  const system = `You are an expert ${jurisdiction} contracts lawyer. 
Draft a complete, enforceable ${docType} based on the user's brief.
The document is drafted to favor: ${ourParty}.
Requirements:
- Numbered sections and subsections (1., 1.1, 1.2, etc.)
- Defined terms in ALL CAPS on first use, then consistently
- Standard ${jurisdiction} boilerplate: governing law, dispute resolution, notices, entire agreement clause
- Signature block at the end
Output the full document text only. No explanation, no commentary, no markdown code fences.`;

  return streamCompletion(system, prompt);
}
