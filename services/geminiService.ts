import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

const getClient = () => {
  if (!apiKey) {
    throw new Error("API_KEY is not set. Image palette extraction is unavailable.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const extractPaletteFromImage = async (image: { data: string; mimeType: string }): Promise<string[]> => {
  try {
    const client = getClient();

    const imagePart = {
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    };
    const textPart = { text: "Analyze the provided image and identify the 5 most dominant and representative colors. Return these colors as a JSON object with a single key 'palette' containing an array of hex code strings. Example: { \"palette\": [\"#RRGGBB\", \"#RRGGBB\", ...] }" };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            palette: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A hex color code string, e.g., '#RRGGBB'",
              },
            }
          },
          required: ['palette']
        },
      },
    });
    
    const jsonResponse = JSON.parse(response.text!);
    const palette = jsonResponse.palette;

    if (!Array.isArray(palette) || palette.length === 0 || !palette.every((c: any) => typeof c === 'string' && c.startsWith('#'))) {
        throw new Error("Invalid palette format returned from AI.");
    }
    
    return palette.slice(0, 5);

  } catch (error) {
    console.error("Error extracting palette with Gemini:", error);
    throw error;
  }
};