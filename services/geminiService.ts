import { GoogleGenAI, Modality, GenerateContentResponse, Part, Type } from "@google/genai";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Feature {
    name: string;
    boundingBox: BoundingBox;
}

export interface EditResult {
    image?: { base64: string; mimeType: string };
    text?: string;
}

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set.");
        throw new Error("API key is missing. Please make sure it's configured in your environment.");
    }
    return new GoogleGenAI({ apiKey });
}

export async function editImage(
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    maskBase64?: string
): Promise<EditResult> {
    const ai = getAiClient();
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
        console.error("Error calling Gemini API for image edit:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        throw error;
    }
}


export async function detectFeatures(
    base64ImageData: string,
    mimeType: string,
): Promise<Feature[]> {
    const ai = getAiClient();
    const imagePart: Part = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const prompt = `Detect all distinct objects or salient features in the image. For each feature, provide a descriptive name and its precise bounding box. The bounding box must be represented as normalized coordinates, where the top-left corner of the image is (0,0) and the bottom-right is (1,1). The properties for the bounding box should be "x", "y", "width", and "height", all of which must be floating-point numbers between 0.0 and 1.0.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: 'A descriptive name for the detected object or feature.'
                            },
                            boundingBox: {
                                type: Type.OBJECT,
                                properties: {
                                    x: { type: Type.NUMBER, description: 'Normalized x-coordinate of the top-left corner (0.0 to 1.0).' },
                                    y: { type: Type.NUMBER, description: 'Normalized y-coordinate of the top-left corner (0.0 to 1.0).' },
                                    width: { type: Type.NUMBER, description: 'Normalized width of the box (0.0 to 1.0).' },
                                    height: { type: Type.NUMBER, description: 'Normalized height of the box (0.0 to 1.0).' },
                                },
                                required: ['x', 'y', 'width', 'height']
                            }
                        },
                        required: ['name', 'boundingBox']
                    }
                },
            },
        });

        const jsonString = response.text;
        const features = JSON.parse(jsonString);
        return features as Feature[];

    } catch (error) {
        console.error("Error calling Gemini API for feature detection:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        throw new Error("The AI model failed to detect features. This can happen with complex images or if the request was blocked.");
    }
}
