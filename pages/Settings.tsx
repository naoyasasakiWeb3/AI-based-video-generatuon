import React, { useEffect, useState, useCallback, useRef } from 'react';
import { YouTubeUser } from '../types';
import { loadGapiClient } from '../services/youtubeService';

// =================================================================================================
// IMPORTANT!
// You MUST replace this placeholder with your own OAuth 2.0 Client ID from the Google Cloud Console.
// The YouTube upload functionality will NOT work without it.
//
// How to get a Client ID:
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Click "+ CREATE CREDENTIALS" -> "OAuth client ID".
// 3. Select "Web application".
// 4. Add "http://localhost:3000" (for local testing) and your deployed app's URL to "Authorized JavaScript origins".
// 5. Click "CREATE" and copy the "Client ID".
// =================================================================================================
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';


const SCOPES = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

interface SettingsProps {
    isSignedIn: boolean;
    setIsSignedIn: (signedIn: boolean) => void;
    user: YouTubeUser | null;
    setUser: (user: YouTubeUser | null) => void;
}

const ClientIdConfigurationGuide = () => (
    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg text-left animate-fade-in">
        <h3 className="font-bold text-lg mb-2 text-yellow-200">Configuration Required: YouTube Client ID</h3>
        <p className="mb-3">To connect your YouTube account, you need to provide an OAuth 2.0 Client ID from the Google Cloud Console.</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-semibold">Google Cloud Credentials page</a>.</li>
            <li>Click <strong>+ CREATE CREDENTIALS</strong> and select <strong>OAuth client ID</strong>.</li>
            <li>Choose <strong>Web application</strong> as the application type.</li>
            <li>Under <strong>Authorized JavaScript origins</strong>, add the URL of this application.</li>
            <li>Click <strong>CREATE</strong>, and copy the generated Client ID.</li>
            <li className="font-semibold">Paste the ID into the <code>YOUTUBE_CLIENT_ID</code> variable at the top of the <code>pages/Settings.tsx</code> file in your editor.</li>
        </ol>
        <p className="mt-3 text-xs text-yellow-400">After updating the Client ID, you may need to reload the application.</p>
    </div>
);

const Settings: React.FC<SettingsProps> = ({ isSignedIn, setIsSignedIn, user, setUser }) => {
    const [error, setError] = useState<string | null>(null);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const tokenClientRef = useRef<any>(null);

    const isClientIdMissing = YOUTUBE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE';

    const fetchUserProfile = useCallback(async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch user profile.');
            const profile = await response.json();
            setUser({
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
            });
        } catch (err) {
             console.error("Error fetching user profile", err);
             setError("Could not retrieve user profile information after sign-in.");
             setUser(null);
        }
    }, [setUser]);


    const handleAuthResponse = useCallback(async (tokenResponse: any) => {
        if (tokenResponse.error) {
            setError(tokenResponse.error_description || 'An unknown error occurred during sign-in.');
            return;
        }
        setError(null);
        window.gapi.client.setToken(tokenResponse);
        setIsSignedIn(true);
        await fetchUserProfile(tokenResponse.access_token);
    }, [setIsSignedIn, fetchUserProfile]);


    useEffect(() => {
        if (isClientIdMissing) return;

        const initialize = async () => {
            await new Promise(resolve => setTimeout(resolve, 500)); // wait for scripts to load

            if (window.google) {
                try {
                    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                        client_id: YOUTUBE_CLIENT_ID,
                        scope: SCOPES,
                        callback: handleAuthResponse,
                    });
                } catch (e) {
                    console.error("Error initializing Google Identity Services:", e);
                    setError("Failed to initialize Google Sign-In. Check your Client ID configuration.");
                }
            } else {
                 setError("Google Sign-In script failed to load. Please check your network or ad-blocker.");
            }

            if (window.gapi) {
                 try {
                    await loadGapiClient();
                    setGapiLoaded(true);
                 } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("An unknown error occurred while initializing the Google API client.");
                    }
                    setGapiLoaded(false);
                 }
            } else {
                setError("Google API Client script failed to load. Please check your network connection.");
            }
        };

        initialize();
    }, [handleAuthResponse, isClientIdMissing]);

    const handleSignIn = () => {
        setError(null);
        if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken();
        } else {
            setError("Google Sign-In is not ready. Please try again in a moment.");
        }
    };
    
    const handleSignOut = () => {
        const token = window.gapi.client.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {});
        }
        window.gapi.client.setToken(null);
        setIsSignedIn(false);
        setUser(null);
    };


    return (
        <div className="text-center p-4 sm:p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                YouTube Account
            </h2>
            
            {isClientIdMissing ? (
                <ClientIdConfigurationGuide />
            ) : (
                <>
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg mb-4">{error}</div>}

                    {!gapiLoaded && !error && <div>Loading Google services...</div>}
                    
                    {gapiLoaded && isSignedIn && user ? (
                         <div className="flex flex-col items-center gap-4">
                            <img src={user.picture} alt="User profile" className="w-20 h-20 rounded-full border-2 border-purple-400" />
                            <p className="text-lg font-semibold">{user.name}</p>
                            <p className="text-gray-400">{user.email}</p>
                            <button
                                onClick={handleSignOut}
                                className="mt-4 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all"
                            >
                                Sign Out
                            </button>
                         </div>
                    ) : gapiLoaded && (
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
                            <p className="text-gray-400 mb-6">
                               Connect your Google Account to enable uploading generated videos directly to your YouTube channel.
                            </p>
                            <button
                                onClick={handleSignIn}
                                disabled={!tokenClientRef.current}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sign In with Google
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Settings;