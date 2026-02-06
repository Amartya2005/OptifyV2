import { useEffect, useRef, useMemo, useState } from 'preact/hooks';
import { marked } from 'marked';

export function ContentDisplay({ content, loading, metadata }) {
    const contentRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Convert markdown to HTML safely
    const html = useMemo(() => {
        if (!content) return '';
        return marked(content);
    }, [content]);

    // Update HTML when content streams in
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.innerHTML = html;
        }
    }, [html]);

    // Cleanup speech when component unmounts
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Handle Text-to-Speech
    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // We use the raw markdown 'content' for reading,
            // but remove some markdown symbols for smoother speech if needed.
            // For now, reading the raw text is usually fine as browsers handle it well.
            const utterance = new SpeechSynthesisUtterance(content);

            utterance.rate = 1.1; // Slightly faster reading speed
            utterance.pitch = 1.0;

            // When it finishes, reset the button state
            utterance.onend = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    if (loading && !content) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <p className="mt-4 text-gray-500 font-mono text-sm">Compressing the universe...</p>
            </div>
        );
    }

    if (!content && !loading) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p className="text-xl">Ready to clear the clutter.</p>
                <p className="text-sm mt-2">Enter a URL above to start.</p>
            </div>
        );
    }

    return (
        <article className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-100 rounded-xl p-6 md:p-10 my-6 transition-all duration-300">
            {/* Header Section */}
            {metadata && (
                <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            {metadata.meta.title || "Untitled Page"}
                        </h1>
                        <a
                            href={metadata.meta.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1 font-mono truncate max-w-md"
                        >
                            🔗 {metadata.meta.url}
                        </a>
                    </div>

                    {/* Listen Button */}
                    <button
                        onClick={handleSpeak}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 shrink-0 ${
                            isSpeaking 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {isSpeaking ? (
                            <>
                                <span className="animate-pulse">●</span> Stop
                            </>
                        ) : (
                            <>
                                <span>🔊</span> Listen
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div
                ref={contentRef}
                className="markdown-content text-lg prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600"
            />
        </article>
    );
}