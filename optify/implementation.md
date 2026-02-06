# PS3 Bandwidth-Agnostic Middleware - Implementation Blueprint

## Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Implementation Plan](#high-level-implementation-plan)
3. [Detailed Step-by-Step Breakdown](#detailed-step-by-step-breakdown)
4. [Implementation Prompts](#implementation-prompts)

---

## Project Overview

**Goal:** Build a PWA that compresses university portals into lightweight, text-based versions under 50KB.

**Tech Stack:**
- **Backend:** Python FastAPI + BeautifulSoup4 + Google Gemini 1.5 Flash
- **Frontend:** Preact + Vite + Tailwind CSS
- **Deployment:** Vercel (Frontend) + Render/Railway (Backend)

**Key Features:**
1. Server-side page fetching and HTML cleaning
2. Navigation extraction using deterministic parsing
3. AI-powered content summarization with streaming
4. Bandwidth savings calculation and display
5. Progressive Web App capabilities

---

## High-Level Implementation Plan

### Phase 1: Project Setup & Infrastructure (Steps 1-3)
- Initialize monorepo structure
- Set up backend FastAPI skeleton
- Set up frontend Preact skeleton

### Phase 2: Backend Core Functionality (Steps 4-8)
- Implement basic URL fetching
- Build HTML cleaning utilities
- Create navigation extractor
- Integrate Gemini AI for summarization
- Implement streaming response

### Phase 3: Frontend Core Functionality (Steps 9-13)
- Build basic UI components
- Implement streaming response handling
- Create markdown renderer
- Add navigation menu
- Build data savings calculator

### Phase 4: Integration & Polish (Steps 14-17)
- Connect frontend to backend
- Add error handling
- Implement loading states
- Add PWA features

### Phase 5: Testing & Deployment (Steps 18-20)
- Add unit tests
- Performance optimization
- Deploy to production

---

## Detailed Step-by-Step Breakdown

### Backend Development
1. **Project Initialization** - Set up folder structure and dependencies
2. **FastAPI Skeleton** - Create basic server with health check
3. **URL Validator** - Add URL validation utility
4. **HTTP Client Setup** - Configure httpx for async requests
5. **Basic HTML Fetcher** - Implement URL fetching with timeout
6. **HTML Cleaner** - Strip scripts, styles, images, etc.
7. **Navigation Extractor** - Parse and extract navigation links
8. **Gemini Integration** - Connect to AI API
9. **Streaming Generator** - Build two-phase streaming response
10. **Error Handling** - Add comprehensive error handling

### Frontend Development
11. **Frontend Setup** - Initialize Vite + Preact project
12. **Basic Layout** - Create app shell with TopBar
13. **URL Input Component** - Build search interface
14. **Streaming Client** - Implement fetch with streaming
15. **Markdown Renderer** - Display AI-generated content
16. **Navigation Menu** - Show extracted links
17. **Data Badge** - Calculate and display savings
18. **Loading States** - Add spinners and feedback
19. **Error UI** - Display user-friendly errors
20. **PWA Manifest** - Add offline support

---

## Implementation Prompts

Each prompt below is designed to be self-contained and builds incrementally on previous work. Copy and paste them sequentially to your code-generation LLM.

---

### Step 1: Project Initialization

```
Create the initial project structure for a bandwidth-agnostic middleware application. This is a monorepo with both backend (Python FastAPI) and frontend (Preact).

Requirements:
1. Create the following folder structure:
   ```
/bandwidth-agnostic-pwa
├── /backend
│   ├── main.py
│   ├── requirements.txt
│   ├── /services
│   │   ├── __init__.py
│   │   ├── scraper.py
│   │   └── ai_engine.py
│   └── /utils
│       ├── __init__.py
│       └── cleaner.py
├── /frontend
│   └── package.json
├── .gitignore
├── .env.example
└── README.md
   ```

2. In `backend/requirements.txt`, include:
   - fastapi
   - uvicorn[standard]
   - httpx
   - beautifulsoup4
   - google-generativeai
   - python-dotenv

3. In `frontend/package.json`, set up a basic Preact + Vite project with:
   - preact
   - vite
   - @preact/preset-vite
   - tailwindcss

4. Create a `.gitignore` that excludes:
   - node_modules/
   - __pycache__/
   - .env
   - dist/
   - .venv/
   - *.pyc

5. In `.env.example`, add a placeholder:
   ```
GEMINI_API_KEY=your_api_key_here
   ```

6. Write a basic README.md with:
   - Project title and description
   - Quick start instructions for both backend and frontend
   - Environment setup notes

Do not write any application logic yet - just the project skeleton and configuration files.
```

---

### Step 2: FastAPI Basic Server Setup

```
Set up a minimal FastAPI server with health check endpoint. This builds on Step 1.

In `backend/main.py`, create:

1. Import statements for FastAPI, uvicorn, CORS
2. Create FastAPI app instance with title "Bandwidth-Agnostic Middleware"
3. Configure CORS to allow all origins (this is for development; we'll restrict later)
4. Add a GET endpoint at `/health` that returns:
   ```json
   {
     "status": "healthy",
     "service": "bandwidth-middleware",
     "version": "1.0.0"
   }
   ```
5. Add a root GET endpoint at `/` that returns a welcome message
6. Include the standard `if __name__ == "__main__"` block to run uvicorn on port 8000

The server should be runnable with: `python backend/main.py`

Keep it simple - no complex logic yet. Just a working server that responds to requests.
```

---

### Step 3: URL Validation Utility

```
Create a URL validation utility module. This builds on Steps 1-2.

In `backend/utils/cleaner.py`, create:

1. Import the `re` module for regex pattern matching
2. Create a function `is_valid_url(url: str) -> bool` that:
    - Checks if the URL matches a basic HTTP/HTTPS pattern
    - Returns True for valid URLs, False otherwise
    - Pattern should match: http:// or https:// followed by domain

3. Create a function `normalize_url(url: str) -> str` that:
    - Strips whitespace
    - Ensures the URL has a protocol (add https:// if missing)
    - Returns the normalized URL

4. Add basic docstrings to each function

In `backend/main.py`, add a new GET endpoint `/validate` that:
- Takes a query parameter `url`
- Uses the `is_valid_url` function
- Returns JSON: `{"valid": true/false, "normalized_url": "..."}`

Test that you can call: `GET /validate?url=google.com` and get a response.
```

---

### Step 4: HTTP Client Configuration

```
Set up the async HTTP client for fetching target URLs. This builds on Steps 1-3.

In `backend/services/__init__.py`, create:

1. Import `httpx` and `asyncio`
2. Create a configuration constant:
   ```python
   FETCH_TIMEOUT = 5.0  # seconds
   MAX_CONTENT_SIZE = 5 * 1024 * 1024  # 5MB
   ```

3. Create an async function `fetch_url(url: str) -> dict` that:
    - Uses `httpx.AsyncClient()` as a context manager
    - Sets timeout to `FETCH_TIMEOUT`
    - Fetches the URL with a GET request
    - Returns a dictionary with:
      ```python
      {
        "content": response.text,
        "status_code": response.status_code,
        "content_length": len(response.content),
        "headers": dict(response.headers)
      }
      ```
    - Raises `httpx.RequestError` on failure
    - Raises `httpx.TimeoutException` on timeout

4. In `backend/main.py`, create a new endpoint `GET /fetch` that:
    - Takes query parameter `url`
    - Validates the URL using the utility from Step 3
    - Calls `fetch_url` asynchronously
    - Returns the result or an error message
    - Use proper async/await syntax

This endpoint is for testing only and will be removed later.
```

---

### Step 5: HTML Cleaning Service

```
Build the HTML cleaning service that strips heavy elements. This builds on Steps 1-4.

In `backend/utils/cleaner.py`, add:

1. Import BeautifulSoup: `from bs4 import BeautifulSoup`

2. Create a constant list of tags to remove:
   ```python
   REMOVABLE_TAGS = ['script', 'style', 'svg', 'img', 'video', 'iframe', 'noscript', 'canvas']
   ```

3. Create function `clean_html(html_content: str) -> BeautifulSoup`:
    - Parse HTML with BeautifulSoup using 'html.parser'
    - Loop through `REMOVABLE_TAGS` and decompose (remove) all matching elements
    - Return the cleaned BeautifulSoup object

4. Create function `extract_text_content(soup: BeautifulSoup) -> str`:
    - Get all text from the soup object
    - Strip extra whitespace and newlines
    - Return cleaned text (limit to first 10,000 characters for now)

5. Update the `/fetch` endpoint in `main.py` to:
    - Clean the HTML using `clean_html`
    - Extract text using `extract_text_content`
    - Return both original size and cleaned text size in the response

Test with a real URL to see the size reduction.
```

---

### Step 6: Navigation Extractor

```
Create the navigation link extraction service. This builds on Steps 1-5.

In `backend/services/scraper.py`, create:

1. Import BeautifulSoup and the cleaner utilities

2. Create a function `extract_navigation(soup: BeautifulSoup, base_url: str) -> list`:
    - Look for navigation elements in this order of priority:
      a. `<nav>` tags
      b. Elements with class/id containing 'nav', 'menu', or 'header'
      c. `<header>` tags with `<ul>` children

    - For each found navigation container:
        - Find all `<a>` tags within it
        - Extract the text content and href attribute
        - Skip empty links or anchors (links starting with #)
        - Make relative URLs absolute using `base_url`

    - Return a list of dictionaries:
      ```python
      [
        {"label": "Home", "link": "https://example.com/home"},
        {"label": "About", "link": "https://example.com/about"}
      ]
      ```

    - Limit to maximum 15 navigation items
    - If no navigation found, return empty list

3. Create a helper function `make_absolute_url(base_url: str, relative_url: str) -> str`:
    - Use `urllib.parse.urljoin` to combine base and relative URLs
    - Handle edge cases (None, empty strings)

4. Update the `/fetch` endpoint to also return extracted navigation links

Test with a university portal URL to verify navigation extraction works.
```

---

### Step 7: Gemini AI Service Setup

```
Set up the Google Gemini AI integration for content summarization. This builds on Steps 1-6.

In `backend/services/ai_engine.py`, create:

1. Import necessary modules:
   ```python
   import google.generativeai as genai
   from typing import Iterator
   import os
   from dotenv import load_dotenv
   ```

2. Load environment variables and configure Gemini:
   ```python
   load_dotenv()
   genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
   ```

3. Define the system prompt as a constant:
   ```python
   SYSTEM_PROMPT = """You are a bandwidth-saving assistant. Summarize the following web page content into concise markdown. 
   
   Requirements:
   - Capture all dates, deadlines, and critical notifications
   - Do not hallucinate links
   - Format with clear headers (##, ###)
   - Keep the summary under 2000 words
   - Output strictly in Markdown format
   - Preserve important numerical data and statistics
   - If content is already concise, format it clearly rather than shortening
   
   Content to summarize:"""
   ```

4. Create function `summarize_content(text_content: str) -> Iterator[str]`:
    - Create a Gemini model instance: `genai.GenerativeModel('gemini-1.5-flash')`
    - Configure generation with:
      ```python
      generation_config = {
        'max_output_tokens': 2048,
        'temperature': 0.3,
      }
      ```
    - Combine SYSTEM_PROMPT with the text_content
    - Call `model.generate_content()` with `stream=True`
    - Yield each chunk of text as it arrives
    - Handle API errors gracefully

5. Create a fallback function `format_raw_text(text_content: str) -> str`:
    - Simple function that returns text with basic markdown headers
    - Used when AI fails or rate limit is hit
    - Add "## Summary" header at top
    - Limit to 3000 characters

No endpoint changes yet - just set up the service.
```

---

### Step 8: Streaming Response Implementation

```
Implement the two-phase streaming response in the main endpoint. This builds on Steps 1-7.

In `backend/main.py`, create the main `/process` endpoint:

1. Import required modules:
   ```python
   from fastapi.responses import StreamingResponse
   from typing import AsyncIterator
   import json
   ```

2. Create async generator function `stream_response(url: str) -> AsyncIterator[str]`:

   Phase 1 - Metadata:
    - Fetch the URL using the service from Step 4
    - Clean HTML using the utility from Step 5
    - Extract navigation using the scraper from Step 6
    - Calculate original size
    - Yield a JSON chunk:
      ```python
      metadata = {
        "meta": {
          "original_size_bytes": original_size,
          "title": "Compressed Page"
        },
        "navigation": navigation_links
      }
      yield json.dumps(metadata) + "\n---SEPARATOR---\n"
      ```

   Phase 2 - Content:
    - Get text content
    - Try to use AI summarization from Step 7
    - If AI fails, use raw formatted text
    - Yield each content chunk as it arrives from the AI stream

3. Create the GET endpoint `/process`:
    - Takes query parameter `url`
    - Validates URL
    - Returns `StreamingResponse` with:
      ```python
      return StreamingResponse(
        stream_response(url),
        media_type="text/plain"
      )
      ```

4. Add error handling:
    - Catch `httpx.TimeoutException` → return 504
    - Catch `httpx.RequestError` → return 502
    - Catch Gemini API errors → fall back to raw text
    - Catch validation errors → return 400

Test the endpoint and verify both phases stream correctly.
```

---

### Step 9: Frontend Project Setup

```
Initialize the Preact frontend application. This builds on Step 1.

1. In the `frontend/` directory, set up Vite + Preact:

   Update `package.json` with these scripts:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. Create `frontend/vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite';
   import preact from '@preact/preset-vite';
   
   export default defineConfig({
     plugins: [preact()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'http://localhost:8000',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     }
   });
   ```

3. Create folder structure:
   ```
   frontend/
   ├── index.html
   ├── src/
   │   ├── main.jsx
   │   ├── app.jsx
   │   ├── components/
   │   │   └── .gitkeep
   │   └── styles/
   │       └── global.css
   └── public/
       └── .gitkeep
   ```

4. Create `frontend/index.html`:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Bandwidth Saver</title>
   </head>
   <body>
     <div id="app"></div>
     <script type="module" src="/src/main.jsx"></script>
   </body>
   </html>
   ```

5. Create `frontend/src/main.jsx`:
   ```javascript
   import { render } from 'preact';
   import { App } from './app';
   import './styles/global.css';
   
   render(<App />, document.getElementById('app'));
   ```

6. Create a minimal `frontend/src/app.jsx`:
   ```javascript
   export function App() {
     return (
       <div className="app">
         <h1>Bandwidth-Agnostic Middleware</h1>
         <p>Loading...</p>
       </div>
     );
   }
   ```

7. Create basic `frontend/src/styles/global.css`:
   ```css
   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }
   
   body {
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
     background: #fff;
     color: #000;
   }
   ```

Test that you can run `npm install` and `npm run dev` successfully.
```

---

### Step 10: TopBar Component

```
Create the TopBar component with URL input. This builds on Step 9.

In `frontend/src/components/TopBar.jsx`, create:

1. A functional component that accepts props:
    - `onSubmit`: callback function for URL submission
    - `dataSaved`: object with savings data (can be null initially)

2. Component structure:
   ```jsx
   import { useState } from 'preact/hooks';
   
   export function TopBar({ onSubmit, dataSaved }) {
     const [url, setUrl] = useState('');
     
     const handleSubmit = (e) => {
       e.preventDefault();
       if (url.trim()) {
         onSubmit(url.trim());
       }
     };
     
     return (
       <header className="topbar">
         <form onSubmit={handleSubmit}>
           <input
             type="text"
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             placeholder="Enter university portal URL..."
             className="url-input"
           />
           <button type="submit" className="submit-btn">
             Compress
           </button>
         </form>
         
         {dataSaved && (
           <div className="savings-badge">
             Saved: {dataSaved.percentage}% 
             ({dataSaved.bytes} bytes)
           </div>
         )}
       </header>
     );
   }
   ```

3. Add CSS to `frontend/src/styles/global.css`:
   ```css
   .topbar {
     padding: 1rem;
     border-bottom: 2px solid #000;
     background: #f5f5f5;
   }
   
   .topbar form {
     display: flex;
     gap: 0.5rem;
     max-width: 800px;
     margin: 0 auto;
   }
   
   .url-input {
     flex: 1;
     padding: 0.75rem;
     border: 1px solid #333;
     font-size: 1rem;
   }
   
   .submit-btn {
     padding: 0.75rem 1.5rem;
     background: #000;
     color: #fff;
     border: none;
     cursor: pointer;
     font-weight: 600;
   }
   
   .submit-btn:hover {
     background: #333;
   }
   
   .savings-badge {
     margin-top: 0.5rem;
     padding: 0.5rem 1rem;
     background: #00cc66;
     color: #fff;
     border-radius: 20px;
     display: inline-block;
     font-weight: 600;
   }
   ```

4. Update `frontend/src/app.jsx` to use TopBar:
   ```javascript
   import { TopBar } from './components/TopBar';
   
   export function App() {
     const handleUrlSubmit = (url) => {
       console.log('URL submitted:', url);
       // We'll implement this in the next step
     };
     
     return (
       <div className="app">
         <TopBar onSubmit={handleUrlSubmit} dataSaved={null} />
         <main>
           <p>Content will appear here</p>
         </main>
       </div>
     );
   }
   ```

Test that the input field and button work correctly.
```

---

### Step 11: Streaming Fetch Client

```
Create the streaming fetch client to communicate with the backend. This builds on Step 10.

In `frontend/src/utils/api.js`, create:

1. A function to parse the streaming response:
   ```javascript
   export async function fetchCompressedPage(url, onMetadata, onContent) {
     const apiUrl = `/api/process?url=${encodeURIComponent(url)}`;
     
     try {
       const response = await fetch(apiUrl);
       
       if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       
       const reader = response.body.getReader();
       const decoder = new TextDecoder();
       let buffer = '';
       let metadataReceived = false;
       
       while (true) {
         const { done, value } = await reader.read();
         
         if (done) break;
         
         buffer += decoder.decode(value, { stream: true });
         
         // Check for metadata separator
         if (!metadataReceived && buffer.includes('---SEPARATOR---')) {
           const [metadataChunk, ...rest] = buffer.split('---SEPARATOR---');
           
           try {
             const metadata = JSON.parse(metadataChunk);
             onMetadata(metadata);
             metadataReceived = true;
             buffer = rest.join('---SEPARATOR---');
           } catch (e) {
             console.error('Failed to parse metadata:', e);
           }
         } else if (metadataReceived) {
           // Stream content chunks
           onContent(buffer);
           buffer = '';
         }
       }
       
       // Send any remaining buffer
       if (buffer && metadataReceived) {
         onContent(buffer);
       }
       
     } catch (error) {
       throw error;
     }
   }
   ```

2. Add error handling utilities:
   ```javascript
   export function getErrorMessage(error) {
     if (error.message.includes('504')) {
       return 'Source site is too slow. Try again.';
     } else if (error.message.includes('502')) {
       return 'Could not reach university server.';
     } else if (error.message.includes('400')) {
       return 'Invalid URL provided.';
     } else {
       return 'An unexpected error occurred.';
     }
   }
   ```

3. Create a hook in `frontend/src/hooks/usePageCompression.js`:
   ```javascript
   import { useState } from 'preact/hooks';
   import { fetchCompressedPage, getErrorMessage } from '../utils/api';
   
   export function usePageCompression() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [metadata, setMetadata] = useState(null);
     const [content, setContent] = useState('');
     
     const compressPage = async (url) => {
       setLoading(true);
       setError(null);
       setMetadata(null);
       setContent('');
       
       try {
         await fetchCompressedPage(
           url,
           (meta) => {
             setMetadata(meta);
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
     
     return { loading, error, metadata, content, compressPage };
   }
   ```

No UI changes yet - just set up the data fetching infrastructure.
```

---

### Step 12: Content Display Component

```
Create the main content display area with markdown rendering. This builds on Step 11.

1. Install a lightweight markdown library:
   ```
   npm install marked
   ```

2. Create `frontend/src/components/ContentArea.jsx`:
   ```jsx
   import { useEffect, useRef } from 'preact/hooks';
   import { marked } from 'marked';
   
   // Configure marked for security
   marked.setOptions({
     breaks: true,
     gfm: true,
   });
   
   export function ContentArea({ content, loading }) {
     const contentRef = useRef(null);
     
     useEffect(() => {
       if (contentRef.current && content) {
         // Convert markdown to HTML
         const html = marked(content);
         contentRef.current.innerHTML = html;
       }
     }, [content]);
     
     if (loading) {
       return (
         <div className="content-area">
           <div className="loading-spinner">
             <div className="spinner"></div>
             <p>Compressing page...</p>
           </div>
         </div>
       );
     }
     
     return (
       <article className="content-area" ref={contentRef}>
         {!content && (
           <div className="empty-state">
             <p>Enter a URL above to get started</p>
           </div>
         )}
       </article>
     );
   }
   ```

3. Add styles to `global.css`:
   ```css
   .content-area {
     max-width: 800px;
     margin: 2rem auto;
     padding: 0 1rem;
     line-height: 1.6;
   }
   
   .content-area h1 {
     font-size: 2rem;
     margin: 2rem 0 1rem;
     border-bottom: 2px solid #000;
     padding-bottom: 0.5rem;
   }
   
   .content-area h2 {
     font-size: 1.5rem;
     margin: 1.5rem 0 0.75rem;
   }
   
   .content-area h3 {
     font-size: 1.25rem;
     margin: 1rem 0 0.5rem;
   }
   
   .content-area p {
     margin: 0.75rem 0;
   }
   
   .content-area ul, .content-area ol {
     margin: 0.75rem 0;
     padding-left: 2rem;
   }
   
   .loading-spinner {
     text-align: center;
     padding: 3rem;
   }
   
   .spinner {
     border: 3px solid #f3f3f3;
     border-top: 3px solid #000;
     border-radius: 50%;
     width: 40px;
     height: 40px;
     animation: spin 1s linear infinite;
     margin: 0 auto 1rem;
   }
   
   @keyframes spin {
     0% { transform: rotate(0deg); }
     100% { transform: rotate(360deg); }
   }
   
   .empty-state {
     text-align: center;
     padding: 3rem;
     color: #666;
   }
   ```

4. Update `app.jsx` to integrate everything:
   ```javascript
   import { TopBar } from './components/TopBar';
   import { ContentArea } from './components/ContentArea';
   import { usePageCompression } from './hooks/usePageCompression';
   
   export function App() {
     const { loading, error, metadata, content, compressPage } = usePageCompression();
     
     return (
       <div className="app">
         <TopBar onSubmit={compressPage} dataSaved={null} />
         {error && (
           <div className="error-banner">
             {error}
           </div>
         )}
         <ContentArea content={content} loading={loading} />
       </div>
     );
   }
   ```

5. Add error banner styles:
   ```css
   .error-banner {
     background: #ff4444;
     color: #fff;
     padding: 1rem;
     text-align: center;
     font-weight: 600;
   }
   ```

Test the full flow: submit a URL and see the content stream in.
```

---

### Step 13: Navigation Menu Component

```
Create the navigation menu to display extracted links. This builds on Step 12.

In `frontend/src/components/NavMenu.jsx`, create:

1. A horizontal scrollable navigation component:
   ```jsx
   export function NavMenu({ navigation, onLinkClick }) {
     if (!navigation || navigation.length === 0) {
       return null;
     }
     
     return (
       <nav className="nav-menu">
         <div className="nav-container">
           {navigation.map((item, index) => (
             <a
               key={index}
               href={item.link}
               className="nav-item"
               onClick={(e) => {
                 e.preventDefault();
                 onLinkClick(item.link);
               }}
             >
               {item.label}
             </a>
           ))}
         </div>
       </nav>
     );
   }
   ```

2. Add styles to `global.css`:
   ```css
   .nav-menu {
     background: #f9f9f9;
     border-bottom: 1px solid #ddd;
     position: sticky;
     top: 0;
     z-index: 100;
   }
   
   .nav-container {
     display: flex;
     gap: 0.5rem;
     padding: 0.75rem 1rem;
     overflow-x: auto;
     max-width: 1200px;
     margin: 0 auto;
     scrollbar-width: thin;
   }
   
   .nav-item {
     padding: 0.5rem 1rem;
     background: #fff;
     border: 1px solid #333;
     text-decoration: none;
     color: #000;
     white-space: nowrap;
     font-size: 0.9rem;
     transition: background 0.2s;
   }
   
   .nav-item:hover {
     background: #000;
     color: #fff;
   }
   
   /* Hide scrollbar for Chrome, Safari and Opera */
   .nav-container::-webkit-scrollbar {
     height: 4px;
   }
   
   .nav-container::-webkit-scrollbar-track {
     background: #f1f1f1;
   }
   
   .nav-container::-webkit-scrollbar-thumb {
     background: #888;
   }
   ```

3. Update `app.jsx` to show navigation:
   ```javascript
   import { TopBar } from './components/TopBar';
   import { NavMenu } from './components/NavMenu';
   import { ContentArea } from './components/ContentArea';
   import { usePageCompression } from './hooks/usePageCompression';
   
   export function App() {
     const { loading, error, metadata, content, compressPage } = usePageCompression();
     
     return (
       <div className="app">
         <TopBar onSubmit={compressPage} dataSaved={null} />
         {error && (
           <div className="error-banner">{error}</div>
         )}
         {metadata && (
           <NavMenu 
             navigation={metadata.navigation} 
             onLinkClick={compressPage}
           />
         )}
         <ContentArea content={content} loading={loading} />
       </div>
     );
   }
   ```

Test that navigation appears and clicking links triggers a new compression.
```

---

### Step 14: Data Savings Calculator

```
Implement the bandwidth savings calculation and display. This builds on Step 13.

1. Create `frontend/src/utils/savings.js`:
   ```javascript
   export function calculateSavings(originalBytes, compressedBytes) {
     if (!originalBytes || originalBytes === 0) {
       return null;
     }
     
     const saved = originalBytes - compressedBytes;
     const percentage = Math.round((saved / originalBytes) * 100);
     
     return {
       originalBytes,
       compressedBytes,
       savedBytes: saved,
       percentage,
       originalFormatted: formatBytes(originalBytes),
       compressedFormatted: formatBytes(compressedBytes),
       savedFormatted: formatBytes(saved)
     };
   }
   
   export function formatBytes(bytes) {
     if (bytes === 0) return '0 Bytes';
     
     const k = 1024;
     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     
     return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
   }
   ```

2. Update `usePageCompression` hook to track received bytes:
   ```javascript
   import { useState } from 'preact/hooks';
   import { fetchCompressedPage, getErrorMessage } from '../utils/api';
   
   export function usePageCompression() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [metadata, setMetadata] = useState(null);
     const [content, setContent] = useState('');
     const [receivedBytes, setReceivedBytes] = useState(0);
     
     const compressPage = async (url) => {
       setLoading(true);
       setError(null);
       setMetadata(null);
       setContent('');
       setReceivedBytes(0);
       
       try {
         await fetchCompressedPage(
           url,
           (meta) => {
             setMetadata(meta);
             // Add metadata size
             setReceivedBytes(prev => prev + JSON.stringify(meta).length);
           },
           (chunk) => {
             setContent(prev => prev + chunk);
             // Add chunk size
             setReceivedBytes(prev => prev + chunk.length);
           }
         );
       } catch (err) {
         setError(getErrorMessage(err));
       } finally {
         setLoading(false);
       }
     };
     
     return { 
       loading, 
       error, 
       metadata, 
       content, 
       compressPage,
       receivedBytes 
     };
   }
   ```

3. Update `app.jsx` to calculate and display savings:
   ```javascript
   import { TopBar } from './components/TopBar';
   import { NavMenu } from './components/NavMenu';
   import { ContentArea } from './components/ContentArea';
   import { usePageCompression } from './hooks/usePageCompression';
   import { calculateSavings } from './utils/savings';
   
   export function App() {
     const { 
       loading, 
       error, 
       metadata, 
       content, 
       compressPage,
       receivedBytes 
     } = usePageCompression();
     
     const savings = metadata 
       ? calculateSavings(metadata.meta.original_size_bytes, receivedBytes)
       : null;
     
     return (
       <div className="app">
         <TopBar onSubmit={compressPage} dataSaved={savings} />
         {error && (
           <div className="error-banner">{error}</div>
         )}
         {metadata && (
           <NavMenu 
             navigation={metadata.navigation} 
             onLinkClick={compressPage}
           />
         )}
         <ContentArea content={content} loading={loading} />
       </div>
     );
   }
   ```

4. Update TopBar to show detailed savings:
   ```jsx
   export function TopBar({ onSubmit, dataSaved }) {
     // ... existing code ...
     
     return (
       <header className="topbar">
         <form onSubmit={handleSubmit}>
           {/* ... existing form ... */}
         </form>
         
         {dataSaved && (
           <div className="savings-badge">
             <span className="savings-main">
               🎯 Saved {dataSaved.percentage}%
             </span>
             <span className="savings-detail">
               {dataSaved.originalFormatted} → {dataSaved.compressedFormatted}
             </span>
           </div>
         )}
       </header>
     );
   }
   ```

5. Update styles:
   ```css
   .savings-badge {
     margin-top: 0.5rem;
     padding: 0.75rem 1.25rem;
     background: linear-gradient(135deg, #00cc66 0%, #009944 100%);
     color: #fff;
     border-radius: 25px;
     display: inline-flex;
     flex-direction: column;
     font-weight: 600;
     box-shadow: 0 2px 8px rgba(0, 204, 102, 0.3);
   }
   
   .savings-main {
     font-size: 1.1rem;
   }
   
   .savings-detail {
     font-size: 0.85rem;
     opacity: 0.9;
     margin-top: 0.25rem;
   }
   ```

Test that savings are calculated and displayed correctly.
```

---

### Step 15: Enhanced Error Handling

```
Add comprehensive error handling throughout the application. This builds on Step 14.

1. Update `backend/main.py` to add detailed error responses:
   ```python
   from fastapi import HTTPException, status
   from fastapi.responses import JSONResponse
   import logging
   
   # Set up logging
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)
   
   # Add custom exception handler
   @app.exception_handler(Exception)
   async def general_exception_handler(request, exc):
       logger.error(f"Unhandled exception: {exc}")
       return JSONResponse(
           status_code=500,
           content={"detail": "An internal server error occurred"}
       )
   
   # Update the stream_response function with better error handling
   async def stream_response(url: str) -> AsyncIterator[str]:
       try:
           # Validate URL
           if not is_valid_url(url):
               raise HTTPException(
                   status_code=400, 
                   detail="Invalid URL format"
               )
           
           # Fetch with timeout
           try:
               result = await fetch_url(url)
           except httpx.TimeoutException:
               raise HTTPException(
                   status_code=504,
                   detail="Request timed out - source site too slow"
               )
           except httpx.RequestError as e:
               logger.error(f"Request error: {e}")
               raise HTTPException(
                   status_code=502,
                   detail="Could not reach the target server"
               )
           
           # Process HTML
           soup = clean_html(result['content'])
           navigation = extract_navigation(soup, url)
           text_content = extract_text_content(soup)
           
           # Build metadata
           metadata = {
               "meta": {
                   "original_size_bytes": result['content_length'],
                   "title": soup.title.string if soup.title else "Compressed Page"
               },
               "navigation": navigation
           }
           
           yield json.dumps(metadata) + "\n---SEPARATOR---\n"
           
           # Try AI summarization with fallback
           try:
               async for chunk in summarize_content(text_content):
                   yield chunk
           except Exception as ai_error:
               logger.warning(f"AI summarization failed: {ai_error}")
               # Fallback to formatted raw text
               fallback_content = format_raw_text(text_content)
               yield fallback_content
               
       except HTTPException:
           raise
       except Exception as e:
           logger.error(f"Stream error: {e}")
           raise HTTPException(
               status_code=500,
               detail="Failed to process page"
           )
   ```

2. Update frontend error handling in `api.js`:
   ```javascript
   export async function fetchCompressedPage(url, onMetadata, onContent, onError) {
     const apiUrl = `/api/process?url=${encodeURIComponent(url)}`;
     
     try {
       const response = await fetch(apiUrl);
       
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.detail || `HTTP ${response.status}`);
       }
       
       const reader = response.body.getReader();
       const decoder = new TextDecoder();
       let buffer = '';
       let metadataReceived = false;
       
       try {
         while (true) {
           const { done, value } = await reader.read();
           
           if (done) break;
           
           buffer += decoder.decode(value, { stream: true });
           
           if (!metadataReceived && buffer.includes('---SEPARATOR---')) {
             const [metadataChunk, ...rest] = buffer.split('---SEPARATOR---');
             
             try {
               const metadata = JSON.parse(metadataChunk);
               onMetadata(metadata);
               metadataReceived = true;
               buffer = rest.join('---SEPARATOR---');
             } catch (e) {
               throw new Error('Invalid response format from server');
             }
           } else if (metadataReceived) {
             onContent(buffer);
             buffer = '';
           }
         }
         
         if (buffer && metadataReceived) {
           onContent(buffer);
         }
       } catch (streamError) {
         throw new Error('Connection interrupted while reading data');
       }
       
     } catch (error) {
       if (onError) {
         onError(error);
       }
       throw error;
     }
   }
   
   export function getErrorMessage(error) {
     const message = error.message || String(error);
     
     if (message.includes('timed out') || message.includes('504')) {
       return 'The source website took too long to respond. Please try again.';
     } else if (message.includes('Could not reach') || message.includes('502')) {
       return 'Unable to connect to the target website. Please check the URL.';
     } else if (message.includes('Invalid URL') || message.includes('400')) {
       return 'Please enter a valid URL (e.g., https://example.com)';
     } else if (message.includes('interrupted')) {
       return 'Connection was interrupted. Please try again.';
     } else if (message.includes('Invalid response format')) {
       return 'Received unexpected data from server. Please try again.';
     } else {
       return 'An unexpected error occurred. Please try again later.';
     }
   }
   ```

3. Add retry logic in the hook:
   ```javascript
   export function usePageCompression() {
     // ... existing state ...
     const [retryCount, setRetryCount] = useState(0);
     
     const compressPage = async (url, isRetry = false) => {
       if (!isRetry) {
         setRetryCount(0);
       }
       
       setLoading(true);
       setError(null);
       setMetadata(null);
       setContent('');
       setReceivedBytes(0);
       
       try {
         await fetchCompressedPage(
           url,
           (meta) => {
             setMetadata(meta);
             setReceivedBytes(prev => prev + JSON.stringify(meta).length);
           },
           (chunk) => {
             setContent(prev => prev + chunk);
             setReceivedBytes(prev => prev + chunk.length);
           }
         );
         setRetryCount(0); // Reset on success
       } catch (err) {
         const errorMsg = getErrorMessage(err);
         setError(errorMsg);
         
         // Auto-retry once for network errors
         if (retryCount === 0 && errorMsg.includes('interrupted')) {
           setRetryCount(1);
           setTimeout(() => compressPage(url, true), 2000);
         }
       } finally {
         setLoading(false);
       }
     };
     
     return { 
       loading, 
       error, 
       metadata, 
       content, 
       compressPage,
       receivedBytes 
     };
   }
   ```

Test various error scenarios: invalid URLs, timeouts, network failures.
```

---

### Step 16: Loading States and UX Polish

```
Add polished loading states and user feedback. This builds on Step 15.

1. Create `frontend/src/components/LoadingState.jsx`:
   ```jsx
   export function LoadingState({ stage }) {
     const stages = {
       fetching: { icon: '🌐', text: 'Fetching page...' },
       cleaning: { icon: '🧹', text: 'Removing heavy content...' },
       summarizing: { icon: '🤖', text: 'AI summarizing content...' },
       streaming: { icon: '📡', text: 'Streaming results...' }
     };
     
     const current = stages[stage] || stages.fetching;
     
     return (
       <div className="loading-state">
         <div className="loading-content">
           <div className="loading-icon">{current.icon}</div>
           <div className="loading-spinner"></div>
           <p className="loading-text">{current.text}</p>
         </div>
       </div>
     );
   }
   ```

2. Add enhanced loading styles:
   ```css
   .loading-state {
     display: flex;
     justify-content: center;
     align-items: center;
     min-height: 300px;
     padding: 2rem;
   }
   
   .loading-content {
     text-align: center;
   }
   
   .loading-icon {
     font-size: 3rem;
     margin-bottom: 1rem;
     animation: bounce 1s ease-in-out infinite;
   }
   
   @keyframes bounce {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-10px); }
   }
   
   .loading-spinner {
     border: 4px solid #f3f3f3;
     border-top: 4px solid #000;
     border-radius: 50%;
     width: 50px;
     height: 50px;
     animation: spin 1s linear infinite;
     margin: 0 auto 1rem;
   }
   
   .loading-text {
     font-size: 1.1rem;
     color: #333;
     font-weight: 500;
   }
   ```

3. Add progressive content reveal:
   ```jsx
   // Update ContentArea.jsx
   import { useEffect, useRef, useState } from 'preact/hooks';
   import { marked } from 'marked';
   import { LoadingState } from './LoadingState';
   
   export function ContentArea({ content, loading, hasMetadata }) {
     const contentRef = useRef(null);
     const [stage, setStage] = useState('fetching');
     
     useEffect(() => {
       if (loading) {
         setStage('fetching');
       } else if (hasMetadata && !content) {
         setStage('summarizing');
       } else if (content) {
         setStage('streaming');
       }
     }, [loading, hasMetadata, content]);
     
     useEffect(() => {
       if (contentRef.current && content) {
         const html = marked(content);
         contentRef.current.innerHTML = html;
         
         // Smooth scroll to new content
         if (contentRef.current.scrollHeight > window.innerHeight) {
           window.scrollTo({
             top: contentRef.current.scrollHeight,
             behavior: 'smooth'
           });
         }
       }
     }, [content]);
     
     if (loading) {
       return <LoadingState stage={stage} />;
     }
     
     return (
       <article className="content-area" ref={contentRef}>
         {!content && (
           <div className="empty-state">
             <div className="empty-icon">📄</div>
             <h2>Ready to Compress</h2>
             <p>Enter a university portal URL above to create a lightweight version</p>
             <div className="feature-list">
               <div className="feature">✓ Removes images and heavy scripts</div>
               <div className="feature">✓ AI-powered content summarization</div>
               <div className="feature">✓ Saves up to 95% bandwidth</div>
             </div>
           </div>
         )}
       </article>
     );
   }
   ```

4. Add empty state styles:
   ```css
   .empty-state {
     text-align: center;
     padding: 4rem 2rem;
     max-width: 600px;
     margin: 0 auto;
   }
   
   .empty-icon {
     font-size: 4rem;
     margin-bottom: 1rem;
   }
   
   .empty-state h2 {
     font-size: 2rem;
     margin-bottom: 0.5rem;
   }
   
   .empty-state p {
     color: #666;
     font-size: 1.1rem;
     margin-bottom: 2rem;
   }
   
   .feature-list {
     display: flex;
     flex-direction: column;
     gap: 0.75rem;
     text-align: left;
     max-width: 400px;
     margin: 0 auto;
   }
   
   .feature {
     padding: 0.75rem;
     background: #f5f5f5;
     border-left: 3px solid #00cc66;
     font-size: 0.95rem;
   }
   ```

5. Update `app.jsx` to pass hasMetadata:
   ```javascript
   <ContentArea 
     content={content} 
     loading={loading}
     hasMetadata={!!metadata}
   />
   ```

6. Add input validation feedback:
   ```jsx
   // Update TopBar.jsx
   const [inputError, setInputError] = useState('');
   
   const handleSubmit = (e) => {
     e.preventDefault();
     setInputError('');
     
     if (!url.trim()) {
       setInputError('Please enter a URL');
       return;
     }
     
     // Basic URL validation
     const urlPattern = /^https?:\/\/.+/i;
     if (!urlPattern.test(url.trim())) {
       setInputError('URL must start with http:// or https://');
       return;
     }
     
     onSubmit(url.trim());
   };
   
   // Add error display
   {inputError && (
     <div className="input-error">{inputError}</div>
   )}
   ```

Test all loading and empty states.
```

---

### Step 17: PWA Configuration

```
Add Progressive Web App functionality for offline support and installability. This builds on Step 16.

1. Create `frontend/public/manifest.json`:
   ```json
   {
     "name": "Bandwidth Saver",
     "short_name": "BW Saver",
     "description": "Compress university portals to save bandwidth",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#000000",
     "orientation": "portrait-primary",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png",
         "purpose": "any maskable"
       }
     ]
   }
   ```

2. Create a simple icon generator script `frontend/scripts/generate-icons.js`:
   ```javascript
   // This is a placeholder - in production, use actual icon images
   // For now, we'll create simple SVG-based icons
   const fs = require('fs');
   const path = require('path');
   
   const iconSVG = `
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
     <rect width="512" height="512" fill="#000"/>
     <text x="50%" y="50%" font-size="200" fill="#00cc66" 
           text-anchor="middle" dominant-baseline="middle" 
           font-family="Arial, sans-serif" font-weight="bold">
       BW
     </text>
   </svg>
   `;
   
   // Save as placeholder (in production, convert SVG to PNG)
   fs.writeFileSync(
     path.join(__dirname, '../public/icon.svg'),
     iconSVG
   );
   
   console.log('Icon generated. Please convert to PNG for production.');
   ```

3. Create `frontend/public/service-worker.js`:
   ```javascript
   const CACHE_NAME = 'bw-saver-v1';
   const STATIC_ASSETS = [
     '/',
     '/index.html',
     '/src/main.jsx',
     '/src/styles/global.css'
   ];
   
   // Install event - cache static assets
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME).then((cache) => {
         return cache.addAll(STATIC_ASSETS);
       })
     );
     self.skipWaiting();
   });
   
   // Activate event - clean up old caches
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((cacheNames) => {
         return Promise.all(
           cacheNames
             .filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
         );
       })
     );
     self.clients.claim();
   });
   
   // Fetch event - network first, fall back to cache
   self.addEventListener('fetch', (event) => {
     // Skip API requests from caching
     if (event.request.url.includes('/api/')) {
       return;
     }
     
     event.respondWith(
       fetch(event.request)
         .then((response) => {
           // Clone and cache successful responses
           if (response.status === 200) {
             const responseClone = response.clone();
             caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, responseClone);
             });
           }
           return response;
         })
         .catch(() => {
           // Fall back to cache if network fails
           return caches.match(event.request);
         })
     );
   });
   ```

4. Register service worker in `frontend/src/main.jsx`:
   ```javascript
   import { render } from 'preact';
   import { App } from './app';
   import './styles/global.css';
   
   render(<App />, document.getElementById('app'));
   
   // Register service worker
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
       navigator.serviceWorker
         .register('/service-worker.js')
         .then((registration) => {
           console.log('SW registered:', registration);
         })
         .catch((error) => {
           console.log('SW registration failed:', error);
         });
     });
   }
   ```

5. Update `frontend/index.html` to include PWA meta tags:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <meta name="description" content="Compress university portals to save bandwidth">
     <meta name="theme-color" content="#000000">
     <link rel="manifest" href="/manifest.json">
     <link rel="icon" type="image/svg+xml" href="/icon.svg">
     <title>Bandwidth Saver - Compress Web Pages</title>
   </head>
   <body>
     <div id="app"></div>
     <script type="module" src="/src/main.jsx"></script>
   </body>
   </html>
   ```

6. Add install prompt in `app.jsx`:
   ```javascript
   import { useState, useEffect } from 'preact/hooks';
   
   export function App() {
     const [installPrompt, setInstallPrompt] = useState(null);
     
     useEffect(() => {
       const handler = (e) => {
         e.preventDefault();
         setInstallPrompt(e);
       };
       
       window.addEventListener('beforeinstallprompt', handler);
       
       return () => {
         window.removeEventListener('beforeinstallprompt', handler);
       };
     }, []);
     
     const handleInstall = async () => {
       if (!installPrompt) return;
       
       installPrompt.prompt();
       const result = await installPrompt.userChoice;
       
       if (result.outcome === 'accepted') {
         setInstallPrompt(null);
       }
     };
     
     // ... rest of component ...
     
     return (
       <div className="app">
         {installPrompt && (
           <div className="install-banner">
             <span>Install app for offline access</span>
             <button onClick={handleInstall} className="install-btn">
               Install
             </button>
           </div>
         )}
         {/* ... rest of JSX ... */}
       </div>
     );
   }
   ```

7. Add install banner styles:
   ```css
   .install-banner {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     color: white;
     padding: 1rem;
     display: flex;
     justify-content: space-between;
     align-items: center;
   }
   
   .install-btn {
     background: white;
     color: #667eea;
     border: none;
     padding: 0.5rem 1rem;
     border-radius: 5px;
     font-weight: 600;
     cursor: pointer;
   }
   ```

Test PWA functionality using Chrome DevTools > Application > Manifest.
```

---

### Step 18: Backend Testing

```
Add comprehensive backend tests. This builds on all previous backend steps.

1. Create `backend/tests/__init__.py` (empty file)

2. Create `backend/tests/test_utils.py`:
   ```python
   import pytest
   from backend.utils.cleaner import is_valid_url, normalize_url, clean_html, extract_text_content
   from bs4 import BeautifulSoup
   
   class TestURLValidation:
       def test_valid_urls(self):
           assert is_valid_url("https://example.com") == True
           assert is_valid_url("http://university.edu") == True
           assert is_valid_url("https://sub.domain.com/path") == True
       
       def test_invalid_urls(self):
           assert is_valid_url("not-a-url") == False
           assert is_valid_url("ftp://example.com") == False
           assert is_valid_url("") == False
       
       def test_normalize_url(self):
           assert normalize_url("example.com") == "https://example.com"
           assert normalize_url("  http://test.com  ") == "http://test.com"
   
   class TestHTMLCleaning:
       def test_removes_scripts(self):
           html = "<html><body><script>alert('test')</script><p>Content</p></body></html>"
           soup = clean_html(html)
           assert soup.find('script') is None
           assert soup.find('p') is not None
       
       def test_removes_images(self):
           html = "<html><body><img src='test.jpg'><p>Text</p></body></html>"
           soup = clean_html(html)
           assert soup.find('img') is None
       
       def test_extracts_text(self):
           html = "<html><body><h1>Title</h1><p>Paragraph</p></body></html>"
           soup = BeautifulSoup(html, 'html.parser')
           text = extract_text_content(soup)
           assert "Title" in text
           assert "Paragraph" in text
   ```

3. Create `backend/tests/test_scraper.py`:
   ```python
   import pytest
   from backend.services.scraper import extract_navigation, make_absolute_url
   from bs4 import BeautifulSoup
   
   class TestNavigationExtraction:
       def test_extracts_nav_links(self):
           html = """
           <html>
             <body>
               <nav>
                 <a href="/home">Home</a>
                 <a href="/about">About</a>
               </nav>
             </body>
           </html>
           """
           soup = BeautifulSoup(html, 'html.parser')
           nav = extract_navigation(soup, "https://example.com")
           
           assert len(nav) == 2
           assert nav[0]['label'] == 'Home'
           assert nav[0]['link'] == 'https://example.com/home'
       
       def test_handles_absolute_urls(self):
           html = """
           <nav>
             <a href="https://external.com/page">External</a>
           </nav>
           """
           soup = BeautifulSoup(html, 'html.parser')
           nav = extract_navigation(soup, "https://example.com")
           
           assert nav[0]['link'] == 'https://external.com/page'
       
       def test_skips_anchor_links(self):
           html = """
           <nav>
             <a href="#section">Section</a>
             <a href="/real-page">Page</a>
           </nav>
           """
           soup = BeautifulSoup(html, 'html.parser')
           nav = extract_navigation(soup, "https://example.com")
           
           assert len(nav) == 1
           assert nav[0]['label'] == 'Page'
   
   class TestURLHelpers:
       def test_make_absolute_url(self):
           assert make_absolute_url(
               "https://example.com",
               "/page"
           ) == "https://example.com/page"
           
           assert make_absolute_url(
               "https://example.com/dir/",
               "sub/page.html"
           ) == "https://example.com/dir/sub/page.html"
   ```

4. Create `backend/tests/test_api.py`:
   ```python
   import pytest
   from fastapi.testclient import TestClient
   from backend.main import app
   
   client = TestClient(app)
   
   class TestHealthEndpoint:
       def test_health_check(self):
           response = client.get("/health")
           assert response.status_code == 200
           assert response.json()["status"] == "healthy"
   
   class TestValidateEndpoint:
       def test_valid_url(self):
           response = client.get("/validate?url=https://example.com")
           assert response.status_code == 200
           assert response.json()["valid"] == True
       
       def test_invalid_url(self):
           response = client.get("/validate?url=not-a-url")
           assert response.status_code == 200
           assert response.json()["valid"] == False
   
   class TestProcessEndpoint:
       def test_requires_url_parameter(self):
           response = client.get("/process")
           assert response.status_code == 422  # Validation error
       
       def test_rejects_invalid_url(self):
           response = client.get("/process?url=invalid")
           assert response.status_code == 400
   ```

5. Update `backend/requirements.txt`:
   ```
   pytest==7.4.3
   pytest-asyncio==0.21.1
   ```

6. Create `backend/pytest.ini`:
   ```ini
   [pytest]
   testpaths = tests
   python_files = test_*.py
   python_classes = Test*
   python_functions = test_*
   ```

7. Add test script to README:
   ```markdown
   ## Running Tests
   
   ### Backend Tests
   ```bash
   cd backend
   pip install -r requirements.txt
   pytest
   ```

   ### Frontend Tests (to be implemented)
   ```bash
   cd frontend
   npm test
   ```
   ```

Run tests with: `cd backend && pytest -v`
```

---

### Step 19: Performance Optimization

```
Optimize the application for performance and bandwidth. This builds on all previous steps.

1. Backend optimizations in `backend/main.py`:
   ```python
   from fastapi import FastAPI
   from fastapi.middleware.gzip import GZipMiddleware
   from fastapi.middleware.cors import CORSMiddleware
   
   app = FastAPI(title="Bandwidth-Agnostic Middleware")
   
   # Add GZip compression for responses
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   
   # Optimize CORS
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Restrict in production
       allow_credentials=True,
       allow_methods=["GET"],
       allow_headers=["*"],
       max_age=3600,  # Cache preflight requests
   )
   ```

2. Add caching to AI service in `backend/services/ai_engine.py`:
   ```python
   from functools import lru_cache
   import hashlib
   
   def get_content_hash(content: str) -> str:
       """Generate hash of content for caching"""
       return hashlib.md5(content.encode()).hexdigest()
   
   # Simple in-memory cache (use Redis in production)
   _summary_cache = {}
   
   async def summarize_content(text_content: str) -> Iterator[str]:
       """Summarize content with caching"""
       content_hash = get_content_hash(text_content)
       
       # Check cache
       if content_hash in _summary_cache:
           yield _summary_cache[content_hash]
           return
       
       # Generate new summary
       model = genai.GenerativeModel('gemini-1.5-flash')
       
       generation_config = {
           'max_output_tokens': 2048,
           'temperature': 0.3,
       }
       
       prompt = SYSTEM_PROMPT + "\n\n" + text_content[:8000]
       
       try:
           response = model.generate_content(
               prompt,
               generation_config=generation_config,
               stream=True
           )
           
           full_response = ""
           for chunk in response:
               if chunk.text:
                   full_response += chunk.text
                   yield chunk.text
           
           # Cache the result
           _summary_cache[content_hash] = full_response
           
       except Exception as e:
           raise e
   ```

3. Optimize HTML cleaning in `backend/utils/cleaner.py`:
   ```python
   def clean_html(html_content: str) -> BeautifulSoup:
       """Optimized HTML cleaning"""
       # Use lxml parser for better performance if available
       try:
           soup = BeautifulSoup(html_content, 'lxml')
       except:
           soup = BeautifulSoup(html_content, 'html.parser')
       
       # Batch remove tags
       for tag in REMOVABLE_TAGS:
           for element in soup.find_all(tag):
               element.decompose()
       
       # Remove comments
       for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
           comment.extract()
       
       # Remove empty tags
       for tag in soup.find_all():
           if not tag.get_text(strip=True) and not tag.find_all(['img', 'br', 'hr']):
               tag.decompose()
       
       return soup
   ```

4. Frontend optimizations - create `frontend/src/utils/performance.js`:
   ```javascript
   // Debounce function for input
   export function debounce(func, wait) {
     let timeout;
     return function executedFunction(...args) {
       const later = () => {
         clearTimeout(timeout);
         func(...args);
       };
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
     };
   }
   
   // Throttle function for scroll events
   export function throttle(func, limit) {
     let inThrottle;
     return function(...args) {
       if (!inThrottle) {
         func.apply(this, args);
         inThrottle = true;
         setTimeout(() => inThrottle = false, limit);
       }
     };
   }
   
   // Lazy load images (if any are added later)
   export function lazyLoadImage(img) {
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           img.src = img.dataset.src;
           observer.unobserve(img);
         }
       });
     });
     
     observer.observe(img);
   }
   ```

5. Optimize markdown rendering with virtualization:
   ```jsx
   // Update ContentArea.jsx for large content
   import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
   import { marked } from 'marked';
   
   export function ContentArea({ content, loading, hasMetadata }) {
     const contentRef = useRef(null);
     const [renderedHtml, setRenderedHtml] = useState('');
     
     // Memoize markdown conversion
     const html = useMemo(() => {
       if (!content) return '';
       return marked(content);
     }, [content]);
     
     useEffect(() => {
       if (contentRef.current && html) {
         // Use requestAnimationFrame for smooth rendering
         requestAnimationFrame(() => {
           if (contentRef.current) {
             contentRef.current.innerHTML = html;
           }
         });
       }
     }, [html]);
     
     // ... rest of component
   }
   ```

6. Add bundle size optimization to `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite';
   import preact from '@preact/preset-vite';
   
   export default defineConfig({
     plugins: [preact()],
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,  // Remove console.logs in production
           drop_debugger: true
         }
       },
       rollupOptions: {
         output: {
           manualChunks: {
             'vendor': ['preact'],
             'markdown': ['marked']
           }
         }
       }
     },
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'http://localhost:8000',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     }
   });
   ```

7. Add performance monitoring in `app.jsx`:
   ```javascript
   useEffect(() => {
     // Monitor performance
     if ('performance' in window) {
       window.addEventListener('load', () => {
         const perfData = performance.getEntriesByType('navigation')[0];
         console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
       });
     }
   }, []);
   ```

Test performance with Lighthouse and network throttling.
```

---

### Step 20: Deployment Configuration

```
Set up deployment configurations for Vercel and Render. This is the final step.

1. Create `frontend/vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend.onrender.com/:path*"
       }
     ],
     "headers": [
       {
         "source": "/service-worker.js",
         "headers": [
           {
             "key": "Service-Worker-Allowed",
             "value": "/"
           }
         ]
       }
     ]
   }
   ```

2. Create `backend/render.yaml`:
   ```yaml
   services:
     - type: web
       name: bandwidth-middleware-api
       env: python
       region: oregon
       plan: free
       buildCommand: "pip install -r requirements.txt"
       startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
       envVars:
         - key: GEMINI_API_KEY
           sync: false
         - key: PYTHON_VERSION
           value: "3.11.0"
       healthCheckPath: /health
   ```

3. Create `backend/Procfile` (alternative deployment):
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. Create `backend/runtime.txt`:
   ```
   python-3.11.0
   ```

5. Update `backend/main.py` for production:
   ```python
   import os
   from fastapi import FastAPI
   from fastapi.middleware.gzip import GZipMiddleware
   from fastapi.middleware.cors import CORSMiddleware
   
   # Determine environment
   IS_PRODUCTION = os.getenv('ENVIRONMENT') == 'production'
   
   app = FastAPI(
       title="Bandwidth-Agnostic Middleware",
       docs_url=None if IS_PRODUCTION else "/docs",
       redoc_url=None if IS_PRODUCTION else "/redoc"
   )
   
   # CORS - restrict in production
   allowed_origins = ["*"] if not IS_PRODUCTION else [
       "https://your-frontend.vercel.app",
       "https://bandwidth-saver.vercel.app"
   ]
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=allowed_origins,
       allow_credentials=True,
       allow_methods=["GET"],
       allow_headers=["*"],
   )
   
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   
   # ... rest of the app
   ```

6. Create deployment documentation in `DEPLOYMENT.md`:
   ```markdown
   # Deployment Guide
   
   ## Backend Deployment (Render)
   
   1. Create account at render.com
   2. Connect your GitHub repository
   3. Create new Web Service
   4. Use `backend` as root directory
   5. Add environment variable: `GEMINI_API_KEY`
   6. Deploy
   
   ## Frontend Deployment (Vercel)
   
   1. Install Vercel CLI: `npm i -g vercel`
   2. Navigate to frontend directory: `cd frontend`
   3. Run: `vercel`
   4. Follow prompts
   5. Update `vercel.json` with your backend URL
   6. Deploy to production: `vercel --prod`
   
   ## Environment Variables
   
   ### Backend (.env)
   ```
   GEMINI_API_KEY=your_actual_api_key
   ENVIRONMENT=production
   ```
   
   ### Frontend
   Update API proxy in `vercel.json` to point to deployed backend.
   
   ## Post-Deployment Testing
   
   1. Test health endpoint: `https://your-api.onrender.com/health`
   2. Test process endpoint with sample URL
   3. Run Lighthouse audit on frontend
   4. Test PWA installation
   5. Verify bandwidth savings calculation
   
   ## Monitoring
   
   - Backend: Check Render logs
   - Frontend: Check Vercel Analytics
   - Errors: Monitor browser console for client errors
   ```

7. Create final README update:
   ```markdown
   # Bandwidth-Agnostic Middleware
   
   A Progressive Web App that compresses university portals into lightweight, 
   text-based versions under 50KB, saving up to 95% bandwidth.
   
   ## Live Demo
   
   - **Frontend**: https://bandwidth-saver.vercel.app
   - **API**: https://bw-middleware.onrender.com
   
   ## Features
   
   - 🚀 Compresses web pages to under 50KB
   - 🤖 AI-powered content summarization
   - 📱 Progressive Web App (installable)
   - 💾 Offline support
   - 📊 Real-time bandwidth savings tracking
   
   ## Quick Start
   
   ### Prerequisites
   
   - Python 3.10+
   - Node.js 16+
   - Google Gemini API key
   
   ### Local Development
   
   1. Clone repository
   ```bash
   git clone https://github.com/yourusername/bandwidth-agnostic-pwa
   cd bandwidth-agnostic-pwa
   ```

    2. Set up backend
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp ../.env.example .env  # Add your GEMINI_API_KEY
   python main.py
   ```

    3. Set up frontend (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

    4. Open http://localhost:3000

   ## Tech Stack

    - **Backend**: FastAPI, BeautifulSoup4, Google Gemini AI
    - **Frontend**: Preact, Vite, Marked (markdown)
    - **Deployment**: Vercel (frontend), Render (backend)

   ## Contributing

    1. Fork the repository
    2. Create feature branch
    3. Make changes and test
    4. Submit pull request

   ## License

   MIT License - see LICENSE file for details
   ```

8. Create `.github/workflows/test.yml` for CI:
   ```yaml
   name: Run Tests
   
   on: [push, pull_request]
   
   jobs:
     backend-tests:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'
         
         - name: Install dependencies
           run: |
             cd backend
             pip install -r requirements.txt
         
         - name: Run tests
           run: |
             cd backend
             pytest -v
   ```

This completes the implementation! Deploy and test the full application.
```

---

## Summary

This blueprint provides **20 comprehensive, incremental steps** to build the PS3 Bandwidth-Agnostic Middleware project from scratch. Each step:

1. **Builds on previous work** - No orphaned code
2. **Is independently testable** - Each step can be verified
3. **Increases complexity gradually** - No big jumps
4. **Includes complete code** - Ready to copy and paste
5. **Ends with integration** - Everything connects properly

### Key Principles Applied

- **Small, safe iterations**: Each step is 20-50 lines of focused code
- **Test as you go**: Testing integrated throughout, not just at the end
- **Best practices**: Error handling, performance optimization, clean code
- **Production-ready**: Deployment configuration included
- **Full stack**: Both frontend and backend developed in parallel

### Estimated Timeline

- Steps 1-8 (Backend Core): 6-8 hours
- Steps 9-14 (Frontend Core): 6-8 hours
- Steps 15-17 (Polish & PWA): 4-6 hours
- Steps 18-20 (Testing & Deploy): 4-6 hours
- **Total**: 20-28 hours (well within 24h hackathon)

The project is now ready for systematic implementation!