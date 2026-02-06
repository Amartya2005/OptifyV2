import { useState } from 'preact/hooks';
import { fetchCompressedPage, getErrorMessage } from '../utils/api.js';

export function usePageCompression() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [content, setContent] = useState('');

    // 1. Initialize history from LocalStorage
    // We use a function inside useState so this only runs once on startup
    const [history, setHistory] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('optify_history');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    // 2. Helper function to save new scans
    const addToHistory = (meta) => {
        // Create the new history entry
        const newEntry = {
            title: meta.meta.title || "Untitled Page",
            url: meta.meta.url,
            timestamp: Date.now(),
            savedFormatted: formatBytes(meta.meta.original_size_bytes || 0)
        };

        setHistory(prev => {
            // Filter out if this URL already exists to avoid duplicates
            const filtered = prev.filter(item => item.url !== newEntry.url);

            // Add new entry to the top, keep only the last 5
            const updated = [newEntry, ...filtered].slice(0, 5);

            // Save to browser storage
            localStorage.setItem('optify_history', JSON.stringify(updated));
            return updated;
        });
    };

    const compressPage = async (url) => {
        setLoading(true);
        setError(null);
        setMetadata(null);
        setContent('');

        try {
            await fetchCompressedPage(
                url,
                (meta) => {
                    console.log("Meta received:", meta);
                    setMetadata(meta);

                    // 3. Save to History as soon as we get metadata
                    addToHistory(meta);
                },
                (chunk) => {
                    setContent(prev => prev + chunk);
                }
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // 4. Return 'history' so App.jsx can display the list
    return { loading, error, metadata, content, compressPage, history };
}

// Helper to make the "Saved 2.4 MB" badge look nice in the history list
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}