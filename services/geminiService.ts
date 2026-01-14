import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRateResponse, NearbyStationsResponse, GasStation } from "../types";

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

export const fetchNearbyGasStations = async (lat: number, lng: number): Promise<NearbyStationsResponse> => {
  try {
    // Using gemini-2.5-flash for Maps grounding as per SDK requirements
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: "Find 3 gas stations nearby. For each, strictly follow this format on a new line: Name | Address | Price (approx). If price is unknown, say 'N/A'. Do not include any intro or outro text.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const text = response.text || "";
    // Simple parsing based on the requested pipe format
    const lines = text.split('\n').filter(l => l.includes('|'));
    const stations: GasStation[] = lines.map(line => {
        const parts = line.split('|').map(s => s.trim());
        return { 
          name: parts[0] || "Unknown Station", 
          address: parts[1] || "Unknown Address", 
          price: parts[2] || "N/A" 
        };
    });

    // Extract sources (Maps attribution)
    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
       chunks.forEach((chunk: any) => {
        // Maps grounding often provides attribution via groundingChunks
        if (chunk.web?.uri) sources.push(chunk.web.uri);
       });
    }

    return { stations, sources };

  } catch (error) {
    console.error("Maps error", error);
    return { stations: [], sources: [] };
  }
};