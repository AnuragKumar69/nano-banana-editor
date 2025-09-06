
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export interface EditResult {
    image?: { base64: string; mimeType: string };
    text?: string;
}

export async function editImage(
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<EditResult> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set.");
        throw new Error("API key is missing. Please make sure it's configured in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: prompt,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const result: EditResult = {};

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    result.text = part.text;
                } else if (part.inlineData) {
                    result.image = {
                        base64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }

        if (!result.image) {
            // Check for safety ratings or other reasons for no image
            const blockReason = response.candidates?.[0]?.finishReason;
            if(blockReason === 'SAFETY') {
                 throw new Error("The request was blocked for safety reasons. Please try a different prompt.");
            }
            throw new Error("The model did not return an image. It might have refused the request. Try being more descriptive.");
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Pass a more user-friendly error message
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        throw new Error("Failed to communicate with the AI model. Please try again later.");
    }
}
