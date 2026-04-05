import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { GasStationData } from '../store/useAppStore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const setGasStationsFunc: FunctionDeclaration = {
  name: "setGasStations",
  description: "Set the list of gas stations found in the search",
  parameters: {
    type: Type.OBJECT,
    properties: {
      stations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stationName: { type: Type.STRING, description: "Name of the gas station" },
            address: { type: Type.STRING, description: "Street address of the station" },
            city: { type: Type.STRING, description: "City where the station is located" },
            distance: { type: Type.NUMBER, description: "Distance in miles from the search location (if applicable)" },
            price: { type: Type.NUMBER, description: "Current price of regular gas. MUST be in standard decimal format (e.g., 1.859, not 185.9)" },
            currency: { type: Type.STRING, description: "Currency of the price (e.g., USD, CAD, EUR)" },
            unit: { type: Type.STRING, description: "Unit of the price (e.g., Gallon, Liter)" }
          },
          required: ["stationName", "address", "city", "price", "currency", "unit"]
        }
      }
    },
    required: ["stations"]
  }
};

export async function fetchGasStations(query: string, lat?: number, lng?: number): Promise<GasStationData[]> {
  let prompt = `Find real, current gas stations and their regular gas prices for the search query: "${query}". `;
  if (lat && lng) {
    prompt += `The user's current location is latitude ${lat}, longitude ${lng}. Sort the results by distance from this location. `;
  }
  prompt += `
CRITICAL INSTRUCTIONS:
1. Use Google Search to find authentic, real-time data specifically from sources like GasBuddy.com.
2. PRICE FORMATTING: You MUST return prices in standard decimal format (e.g., 3.50 for $3.50). If a source lists prices in cents (like 185.9¢ in Canada), you MUST convert it to dollars (e.g., 1.859). Never return a price like 185.9.
3. Return at least 5-10 stations if possible.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} },
          { functionDeclarations: [setGasStationsFunc] }
        ],
        toolConfig: { includeServerSideToolInvocations: true },
        temperature: 0.2,
      }
    });

    const functionCall = response.functionCalls?.[0];
    if (functionCall && functionCall.name === 'setGasStations') {
      const args = functionCall.args as any;
      if (args && args.stations) {
        return args.stations.map((s: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          stationName: s.stationName,
          address: s.address,
          city: s.city,
          distance: s.distance,
          fuelType: 'Regular',
          price: s.price,
          currency: s.currency as any,
          unit: s.unit as any,
          timestamp: Date.now()
        }));
      }
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching gas stations:", error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
       throw new Error("API_QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export function getFallbackData(query: string): GasStationData[] {
  const city = query.split(',')[0] || 'Unknown City';
  const basePrice = 3.50 + Math.random() * 0.5;
  return [
    {
      id: Math.random().toString(36).substring(2, 9),
      stationName: 'Shell (Fallback Data)',
      address: '100 Main St',
      city: city,
      distance: 0.8,
      fuelType: 'Regular',
      price: basePrice,
      currency: 'USD',
      unit: 'Gallon',
      timestamp: Date.now()
    },
    {
      id: Math.random().toString(36).substring(2, 9),
      stationName: 'Chevron (Fallback Data)',
      address: '200 Oak Ave',
      city: city,
      distance: 1.2,
      fuelType: 'Regular',
      price: basePrice + 0.12,
      currency: 'USD',
      unit: 'Gallon',
      timestamp: Date.now()
    },
    {
      id: Math.random().toString(36).substring(2, 9),
      stationName: 'Arco (Fallback Data)',
      address: '300 Pine St',
      city: city,
      distance: 1.5,
      fuelType: 'Regular',
      price: basePrice - 0.15,
      currency: 'USD',
      unit: 'Gallon',
      timestamp: Date.now()
    },
    {
      id: Math.random().toString(36).substring(2, 9),
      stationName: 'Costco (Fallback Data)',
      address: '400 Wholesale Way',
      city: city,
      distance: 3.0,
      fuelType: 'Regular',
      price: basePrice - 0.30,
      currency: 'USD',
      unit: 'Gallon',
      timestamp: Date.now()
    }
  ];
}
