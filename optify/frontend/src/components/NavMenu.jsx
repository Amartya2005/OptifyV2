export function NavMenu({ navigation, onLinkClick }) {
    if (!navigation || navigation.length === 0) return null;

    return (
        <nav className="sticky top-[73px] z-40 bg-white/95 backdrop-blur border-b border-gray-100 overflow-x-auto custom-scrollbar">
            {/* CHANGED: Removed 'max-w-5xl mx-auto' so it spans the full screen width */}
            <div className="w-full px-4">
                <div className="flex items-center gap-1 py-3 whitespace-nowrap">
          <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wider">
            Quick Links
          </span>

                    {navigation.map((item, index) => (
                        <button
                            key={index}
                            title={item.link}
                            onClick={() => onLinkClick(item.link)}
                            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-all active:scale-95"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}