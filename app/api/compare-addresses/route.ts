import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { address1, address2 } = await request.json();

    if (!address1 || !address2) {
      return Response.json(
        { error: "Both addresses are required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return Response.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Compare these two addresses and determine if they refer to the same location. Return only a valid JSON object with exactly this format and these fields - nothing else:
    {
      "match": boolean,
      "confidence": number between 0 and 1,
      "explanation": string
    }

    Address 1: ${address1}
    Address 2: ${address2}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw Gemini response:", text); // Debug log

    try {
      // Try to extract JSON if the response contains extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;

      const parsedResponse = JSON.parse(jsonStr);

      // Validate response format
      if (
        typeof parsedResponse.match !== "boolean" ||
        typeof parsedResponse.confidence !== "number" ||
        typeof parsedResponse.explanation !== "string" ||
        parsedResponse.confidence < 0 ||
        parsedResponse.confidence > 1
      ) {
        console.error("Invalid response structure:", parsedResponse);
        return Response.json(
          { error: "Invalid response format from AI model" },
          { status: 500 }
        );
      }

      return Response.json(parsedResponse);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response text:", text);
      return Response.json(
        {
          error: "Invalid response from AI model",
          details: process.env.NODE_ENV === "development" ? text : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in address comparison:", error);
    return Response.json(
      {
        error: "Failed to compare addresses",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
