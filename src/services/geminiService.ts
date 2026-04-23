import { GoogleGenAI, Type } from "@google/genai";
import { MASTER_SYSTEM_PROMPT } from "../lib/prompts";

// The API key is securely injected into the environment by AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RapEngineResponse {
  flowBlueprint: {
    rhymeSchemeMap: string;
    syllableCountPerBar: string;
    cadenceNotes: string;
    stressPatternNotes: string;
    patternShifts: string;
  };
  lyrics: string;
}

export async function generateRapLyrics(
  referenceLyrics: string,
  topic: string,
  debugMode: boolean = false
): Promise<RapEngineResponse> {
  const prompt = `REFERENCE LYRICS:\n${referenceLyrics}\n\nTOPIC/THEME FOR NEW LYRICS:\n${topic || 'Freeform / No specific topic'}\n\nDEBUG MODE: ${debugMode ? 'ENABLED' : 'DISABLED'}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flowBlueprint: {
            type: Type.OBJECT,
            properties: {
              rhymeSchemeMap: { type: Type.STRING, description: "Detailed map of the end rhyme structure, internal rhymes, and pattern types." },
              syllableCountPerBar: { type: Type.STRING, description: "Estimated syllable count and variation pattern mapping." },
              cadenceNotes: { type: Type.STRING, description: "Analysis of fast/slow sections, breath points, and tight vs open phrasing." },
              stressPatternNotes: { type: Type.STRING, description: "Where emphasis lands rhythmically and which syllables carry weight." },
              patternShifts: { type: Type.STRING, description: "Any flow switches, momentum resets, or structural changes." }
            },
            description: "The Flow Blueprint generated from analyzing the reference lyrics."
          },
          lyrics: {
            type: Type.STRING,
            description: "The final, 100% original lyrics based on the blueprint and requested topic."
          }
        },
        required: ["flowBlueprint", "lyrics"]
      },
      temperature: 0.7,
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  
  try {
    return JSON.parse(jsonStr) as RapEngineResponse;
  } catch (err) {
    console.error("Failed to parse response JSON", err);
    throw new Error("Failed to generate lyrics. Please try again.");
  }
}
