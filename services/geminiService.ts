
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedPrompt } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateSunoPrompt = async (lyrics: string, theme: string): Promise<GeneratedPrompt> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    USER LYRICS:
    ${lyrics}

    USER THEME/STYLE PREFERENCE:
    ${theme || "Surprise me with a unique mix!"}

    Please generate the Style of Music (max 120 chars), Exclude Style, and Structured Lyrics.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          styleOfMusic: { 
            type: Type.STRING, 
            description: "The music style tags, strictly under 120 characters." 
          },
          excludeStyle: { 
            type: Type.STRING, 
            description: "What styles to avoid." 
          },
          structuredLyrics: { 
            type: Type.STRING, 
            description: "The lyrics with metatags integrated." 
          }
        },
        required: ["styleOfMusic", "excludeStyle", "structuredLyrics"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as GeneratedPrompt;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("The Mix Maestro encountered a glitch. Please try again.");
  }
};
