import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Add your Google API key to the .env.local file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

function cleanJson(text: string) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  return match ? match[1] : text;
}

export async function POST(req: NextRequest) {
  const { action, payload } = await req.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    switch (action) {
      case "search": {
        const { query, data } = payload;
        const prompt = `Given the following JSON data, filter it based on the query: "${query}". Return only the filtered JSON data as a valid JSON array. Data: ${JSON.stringify(
          data
        )}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = cleanJson(response.text());
        return NextResponse.json(JSON.parse(responseText));
      }

      case "generate_rule": {
        const { text: inputText } = payload;
        const prompt = `Parse the following text and convert it into a JSON rule. Supported rule types are "coRun", "slotRestriction", "loadLimit", and "phase-window". Text: "${inputText}". Return a single valid JSON object in the format { "type": "...", "tasks": [...], ... }. For "phase-window" rules, if only one task is mentioned, return it in the "tasks" array. For example, "Task T001 must run in phases 1 or 2" should return { "type": "phase-window", "tasks": ["T001"], "phases": [1, 2] }.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = cleanJson(response.text());
        return NextResponse.json(JSON.parse(responseText));
      }

      case "validate_data": {
        const { data, entityType } = payload;
        const prompt = `Analyze the following ${entityType} data for complex validation errors beyond simple checks. Look for logical inconsistencies, conflicting information, or potential issues. Return a JSON array of error messages. Data: ${JSON.stringify(
          data
        )}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = cleanJson(response.text());
        return NextResponse.json(JSON.parse(responseText));
      }

      case "fix_errors": {
        const { errors, clients, workers, tasks } = payload;
        const prompt = `Given the following validation errors and data, please fix the data. Errors: ${JSON.stringify(
          errors
        )}. Data: ${JSON.stringify({
          clients,
          workers,
          tasks,
        })}. Return a single valid JSON object with the fixed data.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = cleanJson(response.text());
        return NextResponse.json(JSON.parse(responseText));
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
