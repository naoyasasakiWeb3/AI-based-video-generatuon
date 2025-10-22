import React from 'react';
import { YouTubeUpload } from '../types';

interface OverviewProps {
    scheduleTime: string;
    setScheduleTime: (time: string) => void;
    youtubeSignedIn: boolean;
    uploadHistory: YouTubeUpload[];
}

const Overview: React.FC<OverviewProps> = ({ scheduleTime, setScheduleTime, youtubeSignedIn, uploadHistory }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Schedule & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-4">
                        Workflow Schedule
                    </h2>
                    <label htmlFor="schedule-time" className="block text-gray-300 mb-2">
                        Set target daily start time:
                    </label>
                    <input
                        type="time"
                        id="schedule-time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white w-full"
                    />
                    <p className="text-xs text-gray-500 mt-3">
                        Note: This is a client-side app. The workflow must be manually started on the 'Generator' tab around the scheduled time.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-4">
                        API Status
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Google AI (Veo/Imagen)</span>
                            <span className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-green-900/70 text-green-300">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">YouTube API</span>
                            {youtubeSignedIn ? (
                                <span className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-green-900/70 text-green-300">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Connected
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-yellow-900/70 text-yellow-300">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    Not Connected
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload History */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                 <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-4">
                    YouTube Upload History
                </h2>
                {uploadHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No uploads yet. Generate a video and upload it to see it here!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-600 text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Trend</th>
                                    <th className="p-3">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadHistory.map(upload => (
                                    <tr key={upload.playlistId} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{new Date(upload.uploadedAt).toLocaleString()}</td>
                                        <td className="p-3 font-medium">{upload.title}</td>
                                        <td className="p-3 text-gray-400 italic">"{upload.trend}"</td>
                                        <td className="p-3">
                                            <a 
                                                href={`https://www.youtube.com/playlist?list=${upload.playlistId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:underline"
                                            >
                                                View Playlist
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overview;
