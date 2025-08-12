import { Rule } from "./types";

// This file will contain placeholder functions for interacting with the Gemini API.
// The actual implementation will be in the API route to protect the API key.

export async function getAiFilteredRows(query: string, data: Record<string, any>[]) {
  // Placeholder: In a real scenario, this would make an API call
  // to a backend endpoint that uses the Gemini API.
  console.log("AI filtering for:", query);
  return data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(query.toLowerCase())
    )
  );
}

export async function getAiGeneratedRule(text: string): Promise<Rule> {
  // Placeholder
  console.log("AI generating rule for:", text);
  if (text.toLowerCase().includes("co-run")) {
    return { type: "coRun", tasks: ["T1_ai", "T2_ai"] };
  }
  return {} as Rule;
}
