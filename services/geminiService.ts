import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

export interface EditResult {
    image?: { base64: string; mimeType: string };
    text?: string;
}

export async function editImage(
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    maskBase64?: string
): Promise<EditResult> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set.");
        throw new Error("API key is missing. Please make sure it's configured in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const imagePart: Part = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const requestParts: Part[] = [imagePart];

    if (maskBase64) {
        const maskPart: Part = {
            inlineData: {
                data: maskBase64,
                mimeType: 'image/png', // Masks are always PNGs from canvas
            },
        };
        requestParts.push(maskPart);
    }
    
    // Add the final text prompt, instructing the model how to use the mask if present
    const fullPrompt = maskBase64 
        ? `The user has provided an image and a mask. The mask highlights a specific region of interest. Apply the following user instruction to the image, taking the masked area into account: ${prompt}`
        : prompt;

    requestParts.push({ text: fullPrompt });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: requestParts,
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
            const blockReason = response.candidates?.[0]?.finishReason;
            if(blockReason === 'SAFETY') {
                 throw new Error("The request was blocked for safety reasons. Please try a different prompt.");
            }
            const modelTextResponse = result.text || "The model did not return an image and may have refused the request.";
            throw new Error(modelTextResponse);
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
             if (error.message.includes('API key not valid')) {
                throw new Error('The provided API key is not valid. Please check your configuration.');
            }
            throw error; // Re-throw the original error message from the model or a generic one
        }
        throw new Error("Failed to communicate with the AI model. Please try again later.");
    }
}