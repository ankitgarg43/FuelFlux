import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRateResponse, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchCurrentExchangeRate = async (): Promise<ExchangeRateResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "What is the current exchange rate for 1 USD to CAD? Return a JSON object with a single field 'rate' containing the numeric value.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rate: {
              type: Type.NUMBER,
              description: "The exchange rate where 1 USD equals this many CAD.",
            },
          },
          required: ["rate"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(text);
    const rate = data.rate;

    // Extract sources from grounding metadata
    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }

    return {
      rate,
      sources,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    // Fallback if API fails or quota exceeded, approx rate
    return {
      rate: 1.35,
      sources: ["Fallback (API Error)"],
    };
  }
};
