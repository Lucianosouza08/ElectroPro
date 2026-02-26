import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          ...history.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "Você é o Assistente Técnico do ElectroPro, um especialista em engenharia elétrica e normas brasileiras (como NBR 5410, NBR 5419, NBR 14039). Ajude os usuários com cálculos, dúvidas técnicas e interpretação de normas. Seja conciso, profissional e preciso.",
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async streamChat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      const response = await this.ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: [
          ...history.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "Você é o Assistente Técnico do ElectroPro, um especialista em engenharia elétrica e normas brasileiras. Ajude os usuários com cálculos, dúvidas técnicas e interpretação de normas. Seja conciso, profissional e preciso.",
        }
      });

      return response;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();
