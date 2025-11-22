import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WasteAnalysisResult, WasteCategory } from "../types";
import { WASTE_ANALYSIS_SYSTEM_INSTRUCTION, CHAT_SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wasteAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: Object.values(WasteCategory),
      description: "The primary category of the waste detected.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100.",
    },
    description: {
      type: Type.STRING,
      description: "A short physical description of the item.",
    },
    disposalAdvice: {
      type: Type.STRING,
      description: "Specific instructions on how to dispose of this in Dhaka (e.g., 'Green bin for composting', 'Give to Tokai/local collector').",
    },
    recyclingPotential: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low", "None"],
      description: "The potential for this item to be recycled.",
    },
    estimatedDecompositionTime: {
      type: Type.STRING,
      description: "Estimated time to decompose in a landfill.",
    },
  },
  required: ["category", "confidence", "description", "disposalAdvice", "recyclingPotential", "estimatedDecompositionTime"],
};

export const analyzeWasteImage = async (base64Image: string): Promise<WasteAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Analyze this waste item. Classify it and provide disposal advice for a resident in Dhaka.",
          },
        ],
      },
      config: {
        systemInstruction: WASTE_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: wasteAnalysisSchema,
        temperature: 0.4, // Lower temperature for more deterministic classification
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result = JSON.parse(response.text) as WasteAnalysisResult;
    return result;
  } catch (error) {
    console.error("Error analyzing waste:", error);
    // Fallback or re-throw depending on app needs. 
    // Returning a safe default to prevent app crash
    return {
      category: WasteCategory.UNKNOWN,
      confidence: 0,
      description: "Could not analyze image.",
      disposalAdvice: "Please try again or dispose of in general waste if unsure.",
      recyclingPotential: "None",
      estimatedDecompositionTime: "Unknown",
    };
  }
};

export const chatWithBot = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting to the server right now. Please check your internet connection.";
  }
};

export const findNearbyCollectionPoints = async (query: string, lat?: number, lng?: number) => {
   // Using Gemini Grounding with Maps if available, otherwise text search
   try {
     const config: any = {
         tools: [{ googleMaps: {} }],
     };

     if (lat && lng) {
         config.toolConfig = {
             retrievalConfig: {
                 latLng: {
                     latitude: lat,
                     longitude: lng
                 }
             }
         };
     }

     const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: `Find waste collection points or recycling centers nearby matching: ${query}. List them clearly.`,
         config: config
     });
     
     // Extract grounding chunks if available for better UI rendering later
     const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
     return { text: response.text, chunks };
   } catch (error) {
       console.error("Maps grounding error", error);
       return { text: "Could not fetch location data at this time.", chunks: [] };
   }
}
