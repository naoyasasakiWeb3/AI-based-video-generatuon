import React, { RefObject } from 'react';
import { GenerationResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ResultsDisplayProps {
    results: GenerationResult;
    video1Ref: RefObject<HTMLVideoElement>;
    video2Ref: RefObject<HTMLVideoElement>;
    onUpload: () => void;
    isUploading: boolean;
    youtubeSignedIn: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    results, 
    video1Ref, 
    video2Ref, 
    onUpload,
    isUploading,
    youtubeSignedIn
}) => {
    
    const handleVideo1End = () => {
        if(video2Ref.current) {
            video2Ref.current.play();
        }
    }
    
    return (
        <div className="mt-8 space-y-8 animate-fade-in">
            {/* Trend */}
            <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 mb-2">
                    Discovered Trend
                </h2>
                <p className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-300 italic">"{results.trend}"</p>
            </div>

            {/* Story */}
            <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 mb-2">
                    Generated Story: {results.story.title}
                </h2>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-300 space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-200 mb-1">Part 1</h3>
                        <p>{results.story.part1}</p>
                    </div>
                    <div className="border-t border-gray-700 my-4"></div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-200 mb-1">Part 2</h3>
                        <p>{results.story.part2}</p>
                    </div>
                </div>
            </div>

            {/* Images */}
            {results.images.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 mb-3">
                        Key Story Images
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {results.images.map((imgBase64, index) => (
                            <div key={index} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                <img
                                    src={`data:image/jpeg;base64,${imgBase64}`}
                                    alt={`Generated image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 bg-black/50 text-white px-2 py-1 text-xs rounded-tr-lg">
                                    {index === 0 ? 'Start' : index === 1 ? 'Middle' : 'End'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos */}
            {results.videos.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 mb-3">
                        Final Video
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.videos[0] && (
                            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                <video ref={video1Ref} src={results.videos[0].url} controls className="w-full" onEnded={handleVideo1End}></video>
                                <p className="p-3 text-sm text-gray-400">Video 1/2</p>
                            </div>
                        )}
                         {results.videos[1] && (
                            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                <video ref={video2Ref} src={results.videos[1].url} controls className="w-full"></video>
                                <p className="p-3 text-sm text-gray-400">Video 2/2</p>
                            </div>
                        )}
                    </div>
                    <p className="text-center text-gray-500 mt-4 text-sm">
                        The first video will automatically play the second upon completion for a seamless story experience.
                    </p>
                    <div className="mt-6 text-center">
                        {youtubeSignedIn ? (
                             <button
                                onClick={onUpload}
                                disabled={isUploading}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto gap-2"
                            >
                                {isUploading ? <><LoadingSpinner /> Uploading...</> : 'Upload to YouTube as Playlist'}
                            </button>
                        ) : (
                            <p className="text-yellow-400 bg-yellow-900/50 border border-yellow-700 p-3 rounded-lg">
                                Please connect your YouTube account in the 'Settings' tab to enable uploads.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;
