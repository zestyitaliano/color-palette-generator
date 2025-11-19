
import { GoogleGenAI, Modality, Type } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string, image?: { data: string; mimeType: string }): Promise<string> => {
  try {
    // Use gemini-2.5-flash-image (Nano Banana) for both text-to-image and image-to-image
    const model = 'gemini-2.5-flash-image';
    const parts: any[] = [];

    if (image) {
        parts.push({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const generatedPart = response.candidates?.[0]?.content?.parts?.[0];
    if (generatedPart && generatedPart.inlineData) {
      return generatedPart.inlineData.data;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw error;
  }
};

export const extractPaletteFromImage = async (image: { data: string; mimeType: string }): Promise<string[]> => {
  try {
    const imagePart = {
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    };
    const textPart = { text: "Analyze the provided image and identify the 5 most dominant and representative colors. Return these colors as a JSON object with a single key 'palette' containing an array of hex code strings. Example: { \"palette\": [\"#RRGGBB\", \"#RRGGBB\", ...] }" };

    const response = await ai.models.generateContent({
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
    
    const jsonResponse = JSON.parse(response.text);
    const palette = jsonResponse.palette;

    if (!Array.isArray(palette) || palette.length === 0 || !palette.every(c => typeof c === 'string' && c.startsWith('#'))) {
        throw new Error("Invalid palette format returned from AI.");
    }
    
    return palette.slice(0, 5);

  } catch (error) {
    console.error("Error extracting palette with Gemini:", error);
    throw error;
  }
};
