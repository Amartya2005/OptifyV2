import { TopBar } from './components/TopBar';
import { NavMenu } from './components/NavMenu';
import { ContentDisplay } from './components/ContentDisplay';
import { usePageCompression } from './hooks/usePageCompression';

// Helper for bandwidth display
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function App() {
    // 1. Get 'history' from our updated hook
    const { loading, error, metadata, content, compressPage, history } = usePageCompression();

    // 2. Calculate Bandwidth Savings for TopBar
    let savings = null;
    if (metadata && content) {
        const original = metadata.meta.original_size_bytes || 0;
        const current = (JSON.stringify(metadata).length + content.length);
        const savedBytes = Math.max(0, original - current);

        if (original > 0) {
            savings = {
                percentage: Math.round((savedBytes / original) * 100),
                savedFormatted: formatBytes(savedBytes),
                usedFormatted: formatBytes(current)
            };
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            {/* Sticky Header with Bandwidth Stats */}
            <TopBar onSubmit={compressPage} dataSaved={savings} />

            {/* Quick Links Menu - Only shows when we have a site loaded */}
            {metadata && (
                <NavMenu
                    navigation={metadata.navigation}
                    onLinkClick={compressPage}
                />
            )}

            <main className="flex-1 px-4 py-6">

                {/* Error Banner */}
                {error && (
                    <div className="max-w-3xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm animate-fade-in">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 text-red-500">⚠️</div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOGIC: Show Content OR Landing Page */}
                {content || loading ? (
                    // 1. ACTIVE VIEW: Showing a compressed page (or loading one)
                    <ContentDisplay
                        content={content}
                        loading={loading}
                        metadata={metadata}
                    />
                ) : (
                    // 2. LANDING VIEW: Showing History (When app is idle)
                    <div className="max-w-2xl mx-auto mt-20 text-center animate-fade-in">
                        <div className="mb-12">
                            <h2 className="text-4xl font-black mb-4 tracking-tighter text-gray-900">
                                Bandwidth is a privilege. <br/>
                                <span className="text-gray-400">Optify democratizes it.</span>
                            </h2>
                            <p className="text-lg text-gray-500">
                                Paste any URL above to compress it by up to 98%.
                            </p>
                        </div>

                        {/* Recent Scans History List */}
                        {history.length > 0 && (
                            <div className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Recent Scans
                                    </h3>
                                </div>

                                {history.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => compressPage(item.url)}
                                        className="group flex items-center justify-between p-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                                                ⚡
                                            </div>
                                            {/* Text */}
                                            <div className="truncate">
                                                <p className="font-bold text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-400 font-mono truncate">{item.url}</p>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <span className="text-xs font-mono bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 whitespace-nowrap ml-4">
                                            Saved {item.savedFormatted}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}