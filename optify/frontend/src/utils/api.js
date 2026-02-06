export async function fetchCompressedPage(url, onMetadata, onContent) {
    // Point to our proxy
    const apiUrl = `/api/process?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get the stream reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';
        let metadataReceived = false;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Decode the raw bytes into text
            buffer += decoder.decode(value, { stream: true });

            // Phase 1: Look for the separator
            if (!metadataReceived && buffer.includes('---SEPARATOR---')) {
                const parts = buffer.split('---SEPARATOR---');
                const metadataChunk = parts[0];
                const remainingContent = parts.slice(1).join('---SEPARATOR---');

                try {
                    // Parse the JSON at the top
                    const metadata = JSON.parse(metadataChunk);
                    onMetadata(metadata);
                    metadataReceived = true;

                    // Any text after the separator is content
                    if (remainingContent) {
                        onContent(remainingContent);
                    }
                    buffer = ''; // Clear buffer
                } catch (e) {
                    console.error('Failed to parse metadata:', e);
                }
            }
            // Phase 2: Stream the rest as content
            else if (metadataReceived) {
                onContent(buffer);
                buffer = '';
            }
        }

        // Flush any remaining data
        if (buffer && metadataReceived) {
            onContent(buffer);
        }

    } catch (error) {
        throw error;
    }
}

export function getErrorMessage(error) {
    const msg = error.message || String(error);
    if (msg.includes('504')) return 'Source site is too slow. Try again.';
    if (msg.includes('502')) return 'Could not reach university server.';
    if (msg.includes('400')) return 'Invalid URL provided.';
    return 'An unexpected error occurred.';
}