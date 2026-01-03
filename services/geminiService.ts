
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCakeRecommendation(occasion: string, preferences: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a cake from a Ugandan bakery for this occasion: "${occasion}" with these preferences: "${preferences}". 
      Mention specific flavors popular in Uganda like vanilla, chocolate, fruit, or red velvet.
      Keep it brief and appetizing.`,
      config: {
        systemInstruction: "You are a helpful cake consultant for Morris Cakes & Confectionery UG. Be friendly and professional.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I recommend our Royal Chocolate Fudge Cake – it's a crowd-pleaser for any occasion!";
  }
}
