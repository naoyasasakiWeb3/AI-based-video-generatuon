export type AspectRatio = '16:9' | '9:16';

export type Page = 'overview' | 'generator' | 'settings';

export enum GenerationStep {
    Idle = "IDLE",
    FindingTrend = "FINDING_TREND",
    WritingStory = "WRITING_STORY",
    GeneratingImages = "GENERATING_IMAGES",
    GeneratingVideo1 = "GENERATING_VIDEO_1",
    GeneratingVideo2 = "GENERATING_VIDEO_2",
    Done = "DONE",
}

export interface Story {
    title: string;
    part1: string;
    part2: string;
}

export interface VideoResult {
    url: string;
    blob: Blob;
}

export interface GenerationResult {
    trend: string;
    story: Story;
    images: string[]; // array of base64 strings
    videos: VideoResult[]; 
}

export interface ImagePrompts {
    start: string;
    middle: string;
    end: string;
}

export interface YouTubeUpload {
    playlistId: string;
    videoIds: string[];
    title: string;
    trend: string;
    uploadedAt: string; // ISO string
}

export interface YouTubeUser {
    name: string;
    email: string;
    picture: string;
}


// FIX: To resolve module augmentation conflicts, `aistudio` is declared as a global variable
// instead of directly augmenting the Window interface. This prevents modifier conflicts with other global types.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    var aistudio: AIStudio;
    interface Window {
        gapi: any; // For Google API Client Library
        google: any; // For Google Identity Services
    }
}
