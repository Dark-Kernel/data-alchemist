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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const prompt = `Parse the following text and convert it into a JSON rule. Supported rule types are "coRun", "slotRestriction", and "loadLimit". Text: "${inputText}". Return a single valid JSON object.`;
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