import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VocabularyItem } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a list of vocabulary words based on a topic string.
 */
export const generateVocabularyList = async (topicPrompt: string): Promise<VocabularyItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of vocabulary words for kids about: ${topicPrompt}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The vocabulary word" },
              definition: { type: Type.STRING, description: "A simple, kid-friendly definition (1 sentence)" },
              emoji: { type: Type.STRING, description: "A single emoji representing the word" },
            },
            required: ["word", "definition", "emoji"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as VocabularyItem[];
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific word using gemini-2.5-flash-image
 */
export const generateImageForWord = async (word: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A cute, colorful, 3D render cartoon style illustration of a ${word} on a plain white background. High quality, kid friendly.`,
          },
        ],
      },
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
        // Just standard generation
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Generates speech audio for a word and definition using gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually a good friendly voice
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return null;

    // Decode Logic
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// Helper to decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM data to AudioBuffer
async function decodeAudioData(
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

export const playAudioBuffer = (buffer: AudioBuffer) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    // Create a new source node for each playback
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
}
