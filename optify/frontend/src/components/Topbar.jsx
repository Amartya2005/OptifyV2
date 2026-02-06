import { useState } from 'preact/hooks';

export function TopBar({ onSubmit, dataSaved }) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) onSubmit(url.trim());
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-accent">⚡</div>
                        <span>Optify</span>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSubmit} className="flex-1 w-full max-w-2xl relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste university URL here..."
                            className="w-full pl-4 pr-32 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none font-medium"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-black text-white px-5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-transform active:scale-95"
                        >
                            Go
                        </button>
                    </form>

                    {/* Stats Badges */}
                    {dataSaved ? (
                        <div className="flex flex-col items-end min-w-[140px]">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Bandwidth Stats</span>
                            <div className="flex items-center gap-2">

                                {/* Green Badge: Saved */}
                                <span className="text-xs bg-green-100 px-2 py-1 rounded-md text-green-700 font-bold border border-green-200" title="Bandwidth Saved">
                  -{dataSaved.savedFormatted}
                </span>

                                {/* Gray Badge: Used (New) */}
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-mono border border-gray-200" title="Actual Bandwidth Used">
                  Used: {dataSaved.usedFormatted}
                </span>

                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:block w-[140px]"></div>
                    )}
                </div>
            </div>
        </header>
    );
}