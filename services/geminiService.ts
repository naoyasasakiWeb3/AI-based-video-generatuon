import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Story, ImagePrompts } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const findTrend = async (): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: "What is a single, specific, and crazy trend popular among the young generation on social media right now? Be very specific and just name the trend.",
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    return response.text.trim();
};

export const generateStory = async (trend: string): Promise<Story> => {
    const ai = getAiClient();
    const prompt = `
        Create a crazy, two-part short story based on the trend: "${trend}".
        The story must have a clear title.
        Part 1 should introduce the world and characters, building up suspense and leading to a major turning point.
        Part 2 should start from that turning point, introduce a twist, and lead to a definitive, surprising conclusion.
        Format the output as a JSON object with keys: "title", "part1", and "part2".
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    part1: { type: Type.STRING },
                    part2: { type: Type.STRING },
                },
                required: ["title", "part1", "part2"],
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Story;
    } catch (e) {
        console.error("Failed to parse story JSON:", response.text);
        throw new Error("Could not generate a valid story structure.");
    }
};

export const generateImagesForStory = async (prompts: ImagePrompts): Promise<[string, string, string]> => {
    const ai = getAiClient();
    const generateImage = async (prompt: string): Promise<string> => {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `hyper-realistic, cinematic, 8k, detailed: ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        return response.generatedImages[0].image.imageBytes;
    };

    const [image1, image2, image3] = await Promise.all([
        generateImage(prompts.start),
        generateImage(prompts.middle),
        generateImage(prompts.end),
    ]);
    
    return [image1, image2, image3];
};

export const generateVideoSegment = async (prompt: string, startImageBase64: string, endImageBase64: string, aspectRatio: AspectRatio): Promise<Blob> => {
    const ai = getAiClient();
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: startImageBase64,
            mimeType: 'image/jpeg',
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
            lastFrame: {
                imageBytes: endImageBase64,
                mimeType: 'image/jpeg',
            },
        }
    });

    const loadingMessages = [
        "Brewing pixels into motion...",
        "Teaching photons how to dance...",
        "Synthesizing the digital dreamscape...",
        "Wrangling rogue algorithms...",
        "This might take a moment, great art needs patience."
    ];
    let messageIndex = 0;
    
    // Simple console log to show progress to developers
    console.log(loadingMessages[messageIndex++]);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        if (!operation.done) {
            console.log(loadingMessages[messageIndex % loadingMessages.length]);
            messageIndex++;
        }
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the generated video. Status: ${videoResponse.statusText}`);
    }

    return videoResponse.blob();
};