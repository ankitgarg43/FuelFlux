import { GoogleGenAI } from "@google/genai";
import { ExchangeRateResponse, NearbyStationsResponse, GasStation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchCurrentExchangeRate = async (): Promise<ExchangeRateResponse> => {
  try {
    // When using googleSearch, do NOT force JSON schema as it conflicts with the tool output.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "What is the current exchange rate for 1 USD to CAD? Answer with just the numeric rate.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text ? String(response.text) : "";
    // Extract the first floating point number from the text
    const match = text.match(/(\d+(\.\d+)?)/);
    const rate = match ? parseFloat(match[0]) : 1.35;

    // Extract sources from grounding metadata safely
    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk && chunk.web && typeof chunk.web.uri === 'string') {
          sources.push(chunk.web.uri);
        }
      });
    }

    const finalRate = (typeof rate === 'number' && !isNaN(rate)) ? rate : 1.35;

    return {
      rate: finalRate,
      sources: sources,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return {
      rate: 1.35,
      sources: [],
    };
  }
};

export const fetchNearbyGasStations = async (lat: number, lng: number): Promise<NearbyStationsResponse> => {
  try {
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

    const text = response.text ? String(response.text) : "";
    // Robust parsing ensuring strings
    const lines = text.split('\n').filter(l => l.includes('|'));
    const stations: GasStation[] = lines.map(line => {
        const parts = line.split('|').map(s => String(s).trim());
        return { 
          name: parts[0] || "Unknown Station", 
          address: parts[1] || "Unknown Address", 
          price: parts[2] || "N/A" 
        };
    });

    // Extract sources (Maps attribution) safely
    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
       chunks.forEach((chunk: any) => {
        if (chunk && chunk.web && typeof chunk.web.uri === 'string') {
            sources.push(chunk.web.uri);
        }
       });
    }

    return { stations, sources };

  } catch (error) {
    console.error("Maps error", error);
    return { stations: [], sources: [] };
  }
};