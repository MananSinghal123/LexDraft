import { streamCompletion } from "../_stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { documentText, disputeScenario, ourPosition, jurisdiction } =
    await req.json();

  const system = `You are a ${jurisdiction} litigation attorney preparing for a deposition in a contract dispute.
Your client's position: ${ourPosition}
Dispute scenario: ${disputeScenario}

Generate targeted deposition questions in these sections:

## Foundation Questions
Establish the witness's familiarity with the contract and their role in its creation.

## Contract Formation & Intent
Probe what the parties intended when drafting key clauses.

## Performance & Breach
Establish what was done or not done under the contract.

## Damages Grounding
Establish the factual basis for damages claimed.

## Impeachment Setup
Lock in testimony that can be used for impeachment later.

Write actual numbered questions. Include [why this question matters] in brackets after key questions. Be specific to the contract's exact language.`;

  return streamCompletion(system, documentText, "gpt-4o", 3000);
}
