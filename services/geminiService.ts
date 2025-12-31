
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedPrompt, Speaker, ImageSize } from "../types";
import { SYSTEM_INSTRUCTION, VOCAL_STYLER_INSTRUCTION } from "../constants";

export const generateSunoPrompt = async (
  lyrics: string, 
  theme: string, 
  speakers: Speaker[],
  structuralTags: string[] = [],
  productionEffects: string[] = [],
  beatSwitchStyle: string = ""
): Promise<GeneratedPrompt> => {
  // Always use a named parameter with process.env.API_KEY directly for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const speakerInfo = speakers.length > 0 
    ? `SPEAKERS IN THIS SONG: ${speakers.map(s => `${s.name} (${s.voice})`).join(', ')}`
    : "Single generic voice.";

  const structuralRequirement = structuralTags.length > 0
    ? `MANDATORY SECTIONS TO INCLUDE: ${structuralTags.map(tag => `[${tag}]`).join(', ')}.`
    : "Use a standard song structure (Intro, Verse, Chorus, etc.) as appropriate.";

  const productionRequirement = productionEffects.length > 0
    ? `MANDATORY PRODUCTION EFFECTS TO INCORPORATE: ${productionEffects.join(', ')}.`
    : "";
    
  const beatSwitchRequirement = beatSwitchStyle 
    ? `BEAT SWITCH INSTRUCTION: When you encounter [Beat Switch] in the lyrics, transition the style to: ${beatSwitchStyle}.`
    : "";

  const prompt = `
    ${speakerInfo}

    ${structuralRequirement}
    ${productionRequirement}
    ${beatSwitchRequirement}

    USER LYRICS:
    ${lyrics}

    USER THEME/STYLE PREFERENCE:
    ${theme || "Surprise me with a unique mix!"}

    Please generate the Style of Music (max 120 chars), Exclude Style, and Structured Lyrics.
  `;

  // Using 'gemini-3-flash-preview' for basic text tasks (summarization/prompt engineering).
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          styleOfMusic: { type: Type.STRING },
          excludeStyle: { type: Type.STRING },
          structuredLyrics: { type: Type.STRING }
        },
        required: ["styleOfMusic", "excludeStyle", "structuredLyrics"]
      }
    }
  });

  // Accessing response text property directly (not as a method).
  return JSON.parse(response.text || '{}') as GeneratedPrompt;
};

export const styleVocalTracks = async (
  lyrics: string, 
  effects: string[], 
  speakers: Speaker[],
  reverbAmount: number = 20,
  delayTime: number = 0
): Promise<GeneratedPrompt> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const speakerInfo = speakers.length > 0 
    ? `SPEAKERS TO USE: ${speakers.map(s => `${s.name} (${s.voice})`).join(', ')}`
    : "Single generic voice.";

  const prompt = `
    ${speakerInfo}

    VOCAL EFFECTS TO APPLY:
    ${effects.map(e => `[${e}]`).join(' ')}

    GRANULAR PARAMETERS:
    - Reverb Mix: ${reverbAmount}%
    - Delay Time: ${delayTime}ms

    RAW LYRICS:
    ${lyrics}

    Apply the speaker tags, requested vocal effects, and incorporate the granular parameters into appropriate metatags (e.g. [Reverb: ${reverbAmount}%]) to the raw lyrics.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: VOCAL_STYLER_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          structuredLyrics: { type: Type.STRING }
        },
        required: ["structuredLyrics"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return {
    ...result,
    styleOfMusic: 'Vocal Style Demo', // Add placeholder for type compatibility
    excludeStyle: '',
  };
};

export const refineSunoPrompt = async (
  currentResult: GeneratedPrompt,
  refinementInstruction: string,
  speakers: Speaker[]
): Promise<GeneratedPrompt> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const speakerInfo = speakers.length > 0 
    ? `SPEAKERS IN THIS SONG: ${speakers.map(s => `${s.name} (${s.voice})`).join(', ')}`
    : "Single generic voice.";

  const prompt = `
    You are a song structure editor. Your task is to refine an existing song structure based on a user's request.

    ${speakerInfo}

    CURRENT STYLE OF MUSIC:
    ${currentResult.styleOfMusic}

    CURRENT STRUCTURED LYRICS:
    ${currentResult.structuredLyrics}

    USER'S REFINEMENT INSTRUCTION:
    "${refinementInstruction}"

    Based on the instruction, please provide a new, updated version of the "Structured Lyrics".
    IMPORTANT:
    1. Only modify the structured lyrics based on the user's instruction.
    2. Keep the "Style of Music" and "Exclude Style" fields exactly the same as the current ones, unless explicitly told to change them.
    3. Fulfill the user's refinement request creatively while maintaining the song's integrity.
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
          styleOfMusic: { type: Type.STRING },
          excludeStyle: { type: Type.STRING },
          structuredLyrics: { type: Type.STRING }
        },
        required: ["styleOfMusic", "excludeStyle", "structuredLyrics"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as GeneratedPrompt;
};


export const generateAudioPreview = async (lyrics: string, speakers: Speaker[]): Promise<string> => {
  // Re-initialize to ensure the latest API key is used right before the call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use the text-to-speech task specific model: 'gemini-2.5-flash-preview-tts'
  const prompt = `TTS the following lyrics with multiple speakers as labeled in the text. Ensure appropriate pacing for a song:
  ${lyrics}`;

  const speakerConfigs = speakers.map(s => ({
    speaker: s.name,
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: s.voice }
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakerConfigs
        }
      }
    }
  });

  // Extract base64 audio data from candidates.
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data received.");
  return base64Audio;
};

export const generateImageFromPrompt = async (prompt: string, imageSize: ImageSize): Promise<string> => {
  // Create a new instance right before the call to use the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        imageSize: imageSize,
        aspectRatio: "1:1", // Best for album art
      },
    },
  });

  // Iterate through parts to find the image data.
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data; // This is the base64 string.
    }
  }

  // If no image part is found, throw an error.
  throw new Error("No image data was returned from the API.");
};


// PCM Decoding Helpers implemented manually as per guidelines.
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
