import React, { useState, useRef, useCallback } from 'react';
import { AspectRatio, GenerationStep, GenerationResult, Story, YouTubeUpload, VideoResult } from '../types';
import { findTrend, generateStory, generateImagesForStory, generateVideoSegment } from '../services/geminiService';
import { createPlaylistAndUploadVideos } from '../services/youtubeService';
import ApiKeySelector from '../components/ApiKeySelector';
import StepIndicator from '../components/StepIndicator';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

interface GeneratorProps {
    youtubeSignedIn: boolean;
    addUploadToHistory: (upload: YouTubeUpload) => void;
}

const Generator: React.FC<GeneratorProps> = ({ youtubeSignedIn, addUploadToHistory }) => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [currentStep, setCurrentStep] = useState<GenerationStep>(GenerationStep.Idle);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  const handleStartGeneration = useCallback(async () => {
    setError(null);
    setResults(null);
    setUploadSuccess(null);
    setCurrentStep(GenerationStep.Idle);

    if (!apiKeySelected) {
        setError("Please select a Veo API key first.");
        return;
    }

    try {
        setCurrentStep(GenerationStep.FindingTrend);
        const trend = await findTrend();
        
        setCurrentStep(GenerationStep.WritingStory);
        const story: Story = await generateStory(trend);
        
        setCurrentStep(GenerationStep.GeneratingImages);
        const imagePrompts = {
            start: `A cinematic shot representing the beginning of this story: ${story.part1}`,
            middle: `A cinematic shot representing the pivotal turning point of this story, bridging the two parts: ${story.part2}`,
            end: `A cinematic shot representing the dramatic conclusion of this story: ${story.part2}`
        };
        const [imageBase64_1, imageBase64_2, imageBase64_3] = await generateImagesForStory(imagePrompts);

        const newResults: GenerationResult = { trend, story, images: [imageBase64_1, imageBase64_2, imageBase64_3], videos: [] };
        setResults(newResults);

        setCurrentStep(GenerationStep.GeneratingVideo1);
        const videoBlob1 = await generateVideoSegment(story.part1, imageBase64_1, imageBase64_2, aspectRatio);
        const videoUrl1 = URL.createObjectURL(videoBlob1);
        const video1: VideoResult = { url: videoUrl1, blob: videoBlob1 };
        
        setResults(prev => prev ? { ...prev, videos: [video1] } : null);

        setCurrentStep(GenerationStep.GeneratingVideo2);
        const videoBlob2 = await generateVideoSegment(story.part2, imageBase64_2, imageBase64_3, aspectRatio);
        const videoUrl2 = URL.createObjectURL(videoBlob2);
        const video2: VideoResult = { url: videoUrl2, blob: videoBlob2 };
        
        setResults(prev => prev ? { ...prev, videos: [...prev.videos, video2] } : null);

        setCurrentStep(GenerationStep.Done);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed at step: ${currentStep}. Error: ${errorMessage}`);
        if (errorMessage.includes("Requested entity was not found")) {
            setError("API Key validation failed. Please try selecting your key again.");
            setApiKeySelected(false);
        }
        setCurrentStep(GenerationStep.Idle);
    }
  }, [apiKeySelected, aspectRatio, currentStep]);

  const handleUpload = async () => {
    if (!results || results.videos.length < 2) {
        setError("Videos are not available for upload.");
        return;
    }
    setIsUploading(true);
    setError(null);
    setUploadSuccess(null);
    try {
        const { playlistId, videoIds } = await createPlaylistAndUploadVideos(
            results.story.title,
            results.trend,
            results.videos[0].blob,
            results.videos[1].blob
        );
        const newUpload: YouTubeUpload = {
            playlistId,
            videoIds,
            title: results.story.title,
            trend: results.trend,
            uploadedAt: new Date().toISOString(),
        };
        addUploadToHistory(newUpload);
        setUploadSuccess(`Successfully uploaded! View playlist: https://www.youtube.com/playlist?list=${playlistId}`);
    } catch (e) {
        console.error("YouTube upload failed", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown YouTube upload error occurred.';
        setError(errorMessage);
    } finally {
        setIsUploading(false);
    }
  };

  const isLoading = currentStep !== GenerationStep.Idle && currentStep !== GenerationStep.Done;

  return (
    <>
        {!apiKeySelected ? (
            <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} />
        ) : (
            <>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <label className="font-medium text-gray-300">Aspect Ratio:</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            disabled={isLoading}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        >
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>
                    </div>
                    <button
                        onClick={handleStartGeneration}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        {isLoading ? 'Generating...' : 'Start Generation'}
                    </button>
                </div>

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center">{error}</div>}
                {uploadSuccess && <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg mb-6 text-center break-words">{uploadSuccess}</div>}
                
                {isLoading && <div className="text-center my-4"><LoadingSpinner /></div>}

                <StepIndicator currentStep={currentStep} />

                {results && (
                    <ResultsDisplay 
                        results={results} 
                        video1Ref={video1Ref} 
                        video2Ref={video2Ref}
                        onUpload={handleUpload}
                        isUploading={isUploading}
                        youtubeSignedIn={youtubeSignedIn}
                    />
                )}
            </>
        )}
    </>
  );
};

export default Generator;
