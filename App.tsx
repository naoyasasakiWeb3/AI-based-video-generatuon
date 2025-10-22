import React, { useState, useEffect, useCallback } from 'react';
import { Page, YouTubeUpload, YouTubeUser } from './types';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import Generator from './pages/Generator';
import Settings from './pages/Settings';

const App: React.FC = () => {
    const [page, setPage] = useState<Page>('overview');
    const [youtubeSignedIn, setYoutubeSignedIn] = useState(false);
    const [youtubeUser, setYoutubeUser] = useState<YouTubeUser | null>(null);
    const [uploadHistory, setUploadHistory] = useState<YouTubeUpload[]>([]);
    const [scheduleTime, setScheduleTime] = useState('19:00');

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('youtubeUploadHistory');
            if (storedHistory) {
                setUploadHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load upload history from localStorage", error);
        }
    }, []);

    const addUploadToHistory = useCallback((upload: YouTubeUpload) => {
        setUploadHistory(prevHistory => {
            const newHistory = [upload, ...prevHistory];
            try {
                localStorage.setItem('youtubeUploadHistory', JSON.stringify(newHistory));
            } catch (error) {
                console.error("Failed to save upload history to localStorage", error);
            }
            return newHistory;
        });
    }, []);

    const renderPage = () => {
        switch (page) {
            case 'overview':
                return <Overview 
                           scheduleTime={scheduleTime} 
                           setScheduleTime={setScheduleTime}
                           youtubeSignedIn={youtubeSignedIn}
                           uploadHistory={uploadHistory} 
                       />;
            case 'generator':
                return <Generator 
                           youtubeSignedIn={youtubeSignedIn} 
                           addUploadToHistory={addUploadToHistory} 
                       />;
            case 'settings':
                return <Settings 
                           isSignedIn={youtubeSignedIn}
                           setIsSignedIn={setYoutubeSignedIn}
                           setUser={setYoutubeUser}
                           user={youtubeUser}
                       />;
            default:
                return <Overview 
                           scheduleTime={scheduleTime} 
                           setScheduleTime={setScheduleTime}
                           youtubeSignedIn={youtubeSignedIn}
                           uploadHistory={uploadHistory} 
                       />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Veo Trend Video Generator
                    </h1>
                    <p className="text-gray-400 mt-2">
                        AI-driven video creation from social trends, with automatic YouTube uploads.
                    </p>
                </header>
                <Navbar activePage={page} setPage={setPage} />
                <main className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-b-2xl shadow-2xl border border-gray-700 border-t-0">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
