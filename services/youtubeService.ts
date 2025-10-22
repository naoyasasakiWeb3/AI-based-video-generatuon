const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

const getAccessToken = (): string => {
    const token = window.gapi?.client?.getToken();
    if (!token?.access_token) {
        throw new Error("YouTube API access token not found. Please sign in again.");
    }
    return token.access_token;
}

export const loadGapiClient = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!process.env.API_KEY) {
            return reject(new Error("API_KEY environment variable not set. This key is required for YouTube API initialization."));
        }

        const handleClientLoad = () => {
            window.gapi.client.init({
                apiKey: process.env.API_KEY,
                discoveryDocs: DISCOVERY_DOCS,
            }).then(() => {
                resolve();
            }).catch((error: any) => {
                console.error("Error initializing GAPI client:", error);
                let detailedError = "Could not initialize Google API client.";
                
                const errorDetails = error?.result?.error;
                if (errorDetails) {
                    detailedError += ` Status: ${errorDetails.code}, Message: ${errorDetails.message}.`;
                    if (errorDetails.status === 'PERMISSION_DENIED' || (errorDetails.message && errorDetails.message.includes('API has not been used'))) {
                        detailedError += " Please ensure the 'YouTube Data API v3' is enabled for your API key in the Google Cloud Console.";
                    }
                } else if (error && error.details) {
                    detailedError += ` Details: ${error.details}`;
                } else {
                     detailedError += " This may be due to a network issue or an incorrect API key configuration."
                }

                reject(new Error(detailedError));
            });
        };

        // gapi.load is asynchronous; it will call our handler once the 'client' library is ready.
        window.gapi.load('client', handleClientLoad);
    });
};


const uploadVideo = async (videoBlob: Blob, title: string, description: string) => {
    const accessToken = getAccessToken();
    
    const metadata = {
        snippet: {
            title,
            description,
        },
        status: {
            privacyStatus: 'private',
        },
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('video', videoBlob);
    
    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });
    
    const data = await response.json();

    if (!response.ok) {
        console.error('YouTube API Error:', data);
        throw new Error(data.error?.message || 'Failed to upload video.');
    }

    return data;
};

export const createPlaylistAndUploadVideos = async (storyTitle: string, trend: string, video1Blob: Blob, video2Blob: Blob) => {
    const accessToken = getAccessToken();
    
    // 1. Create Playlist
    const playlistResponse = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            snippet: {
                title: `Veo Story: ${storyTitle}`,
                description: `An AI-generated two-part video story based on the trend: "${trend}".`,
            },
            status: {
                privacyStatus: 'private',
            },
        }),
    });
    const playlistData = await playlistResponse.json();
    if (!playlistResponse.ok) throw new Error(playlistData.error?.message || 'Failed to create playlist.');
    const playlistId = playlistData.id;

    // 2. Upload Videos
    const video1Data = await uploadVideo(video1Blob, `${storyTitle} - Part 1`, `Part 1 of the story. Trend: ${trend}`);
    const video2Data = await uploadVideo(video2Blob, `${storyTitle} - Part 2`, `Part 2 of the story. Trend: ${trend}`);
    
    // 3. Add to Playlist
    const addToPlaylist = async (videoId: string) => {
         const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId,
                    },
                },
            }),
        });
        const data = await response.json();
        if (!response.ok) console.error(`Failed to add video ${videoId} to playlist`, data);
    };

    await addToPlaylist(video1Data.id);
    await addToPlaylist(video2Data.id);

    return { playlistId, videoIds: [video1Data.id, video2Data.id] };
};