
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getTravelRecommendations = async (destination: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 5 popular travel spots in ${destination}. Include name, category, and a short description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            rating: { type: Type.NUMBER }
          },
          required: ["name", "category", "description", "rating"]
        }
      }
    }
  });
  
  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const generateItinerary = async (destination: string, days: number) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a ${days}-day itinerary for ${destination}. Use JSON format. Ensure each item has a startTime and duration (e.g. "1h", "2h", "30m").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            startTime: { type: Type.STRING },
            duration: { type: Type.STRING },
            activity: { type: Type.STRING },
            location: { type: Type.STRING },
            type: { type: Type.STRING },
            transportation: { type: Type.STRING }
          },
          required: ["day", "startTime", "duration", "activity", "location", "type"]
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse itinerary", e);
    return [];
  }
};
