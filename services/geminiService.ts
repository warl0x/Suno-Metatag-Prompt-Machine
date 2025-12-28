
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedPrompt, Speaker } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateSunoPrompt = async (lyrics: string, theme: string, speakers: Speaker[]): Promise<GeneratedPrompt> => {
  // Always use a named parameter with process.env.API_KEY directly for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const speakerInfo = speakers.length > 0 
    ? `SPEAKERS IN THIS SONG: ${speakers.map(s => `${s.name} (${s.voice})`).join(', ')}`
    : "Single generic voice.";

  const prompt = `
    ${speakerInfo}

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
