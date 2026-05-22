import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client using an environment variable
const anthropic = new Anthropic({ //  Fixed!
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key-for-now'
});

interface OptimizationResult {
  explanation: string;
  suggestedIndexSql: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function analyzeSlowQuery(sqlQuery: string): Promise<OptimizationResult> {
  // If no real API key is present yet, return a structured simulation so our pipeline doesn't break
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-key-for-now') {
    return {
      explanation: "[Claude Simulated] The query performs an expensive full table scan on 'billing_reports' because it lacks an index on the GROUP BY field.",
      suggestedIndexSql: "CREATE INDEX idx_billing_reports_company_revenue ON billing_reports(company_id, revenue);",
      riskAssessment: "LOW"
    };
  }

  const systemPrompt = `
    You are an elite Principal Database Engineer and Query Optimization expert.
    Analyze the incoming slow SQL query and determine the exact database index needed to resolve the performance issue.
    
    You must respond ONLY with a raw, valid JSON object matching this schema. Do not wrap your response in markdown code blocks like \`\`\`json. Output nothing else but the raw object text.
    {
      "explanation": "Brief explanation of why the query is slow and how the index fixes it.",
      "suggestedIndexSql": "The exact CREATE INDEX statement in valid uppercase SQL syntax.",
      "riskAssessment": "LOW" | "MEDIUM" | "HIGH"
    }
  `;

  try {
    // Calling Claude 3.5 Sonnet - standard tier for highly advanced coding reasoning
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1000,
      temperature: 0, // 0 means maximum determinism and consistency for code output
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Optimize this slow query:\n${sqlQuery}` }
      ]
    });

    // Extract the text block content from Claude's response
    const textBlock = message.content[0];
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error("Unexpected response block type from Claude");
    }

    return JSON.parse(textBlock.text) as OptimizationResult;
  } catch (error) {
    console.error("❌ Claude AI Analysis Failure:", error);
    throw error;
  }
}