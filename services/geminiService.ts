
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCakeRecommendation(occasion: string, preferences: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As Chef Morris, suggest the perfect cake or treat from my menu for this occasion: "${occasion}" with these specific preferences: "${preferences}". 
      Focus on flavors like Ugandan vanilla, premium dark chocolate, seasonal fruits, or red velvet.
      Respond as if you are the Master Baker himself, giving a warm, expert recommendation. Keep it appetizing and concise.`,
      config: {
        systemInstruction: "You are Chef Morris, the Master Baker of Morris Cakes & Confectionery UG. You provide expert, friendly, and professional cake consultations. Never mention being an AI or a language model.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Consultation Error:", error);
    return "Based on my years in the kitchen, I highly recommend our signature Midnight Cocoa Forest Cake – it's a masterpiece that never fails to delight!";
  }
}
