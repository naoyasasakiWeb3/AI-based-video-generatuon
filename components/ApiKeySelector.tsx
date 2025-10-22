
import React, { useEffect, useState, useCallback } from 'react';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    const [checkingKey, setCheckingKey] = useState(true);

    const checkAndSetKey = useCallback(async () => {
        setCheckingKey(true);
        try {
            if (await window.aistudio.hasSelectedApiKey()) {
                onKeySelected();
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
        } finally {
            setCheckingKey(false);
        }
    }, [onKeySelected]);

    useEffect(() => {
        checkAndSetKey();
    }, [checkAndSetKey]);
    
    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success and let the main component re-validate on generation attempt
            onKeySelected();
        } catch (error) {
            console.error('Failed to open API key selection:', error);
        }
    };

    if (checkingKey) {
        return <div className="text-center p-8">Checking for API key...</div>;
    }

    return (
        <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Veo API Key Required
            </h2>
            <p className="text-gray-400 mb-6">
                Video generation with Veo requires you to select an API key. Please ensure your project is set up for billing.
            </p>
            <button
                onClick={handleSelectKey}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
            >
                Select API Key
            </button>
            <p className="text-gray-500 mt-4 text-sm">
                For more information on billing, visit{' '}
                <a
                    href="https://ai.google.dev/gemini-api/docs/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:underline"
                >
                    ai.google.dev/gemini-api/docs/billing
                </a>.
            </p>
        </div>
    );
};

export default ApiKeySelector;
