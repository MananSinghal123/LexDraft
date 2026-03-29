import { getOpenAI } from "@/lib/openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { contentText, docType, jurisdiction, ourParty } = await req.json();

  if (!contentText?.trim()) {
    return Response.json(
      { error: "No document content provided" },
      { status: 400 },
    );
  }

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior legal analyst. Analyze the provided ${docType} agreement governed by ${jurisdiction} law, drafted to favor ${ourParty}.

Return a JSON object with exactly this structure:
{
  "overallRisk": "low" | "medium" | "high",
  "executiveSummary": "string — 3 sentences max, plain English",
  "clauses": [
    {
      "id": "c1",
      "title": "short clause name",
      "excerpt": "first 80 characters of the clause text",
      "risk": "low" | "medium" | "high" | "info",
      "issue": "what is wrong or notable, 1 sentence, plain English",
      "fix": "specific suggested replacement language or action",
      "favoredParty": "us" | "them" | "neutral",
      "confidence": 85
    }
  ],
  "missingClauses": [
    { "name": "string", "severity": "critical" | "recommended", "reason": "1 sentence" }
  ],
  "definedTerms": ["Term1", "Term2"],
  "negotiationLeverage": "2-3 sentences on which party has more leverage and why"
}`,
      },
      {
        role: "user",
        content: contentText,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "{}";

  try {
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json(
      { error: "Failed to parse analysis" },
      { status: 500 },
    );
  }
}
