import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";
import { z } from "npm:zod";

const ai = new GoogleGenAI({
  apiKey: Deno.env.get("GEMINI_API_KEY")!,
});

/* ---------- Schema ---------- */

// Expect an array of exactly 5 location objects
const locationArraySchema = z.array(
  z.object({
    name: z.string(),
    address: z.string(),
  })
).length(5);

/* ---------- Handler ---------- */

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid query" }),
        { status: 400 }
      );
    }

    // Generate AI suggestions
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
User request:
"${query}"

Suggest exactly 5 REAL, well-known locations.
Each must include:
- name (string)
- full postal address (string)

Return ONLY structured JSON as an array of 5 objects.
Do not omit any fields. Ensure proper JSON formatting.
`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    // Parse AI response safely
    let aiArray: any[] = [];
    try {
      aiArray = JSON.parse(response.text);
      if (!Array.isArray(aiArray)) throw new Error("AI response is not an array");
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500 }
      );
    }

    // Sanitize: ensure all items have name & address
    const sanitized = aiArray.map((loc: any, i: number) => ({
      name: typeof loc?.name === "string" ? loc.name : `Unknown #${i + 1}`,
      address: typeof loc?.address === "string" ? loc.address : "Unknown address",
    }));

    // Validate against Zod
    const parsedArray = locationArraySchema.parse(sanitized);

    // Return in { places: [...] } format
    return new Response(JSON.stringify({ places: parsedArray }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to generate suggestions:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate suggestions" }),
      { status: 500 }
    );
  }
});

