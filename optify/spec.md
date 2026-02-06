# Project Specification: PS3 "Bandwidth-Agnostic" Middleware
**Version:** 1.0 (Hackathon MVP)
**SDG Alignment:** SDG 10 (Reduced Inequalities)

## 1. Executive Summary
**Goal:** Create a Progressive Web App (PWA) wrapper that acts as a middleware between students with limited internet connectivity and heavy university portals.
**Key KPI:** Deliver a usable, text-lite version of a webpage in **under 50KB**, significantly reducing data usage compared to the original source.
**Core Mechanism:** The system strips non-essential media (images, videos, scripts), extracts navigation deterministically, and uses Gemini 1.5 Flash to generate a concise, streaming markdown summary of the content.

---

## 2. Technical Architecture

### High-Level Flow
1.  **Client (PWA):** User requests a URL.
2.  **Middleware (FastAPI):** Fetches the target URL (Server-Side).
3.  **Processing:**
    * **Scraper:** Extracts navigation links and cleans HTML.
    * **AI Engine:** Sends cleaned text to Gemini 1.5 Flash for summarization.
4.  **Response:** Streams data back to the client in two phases:
    * *Phase 1:* JSON Metadata (Navigation + Stats).
    * *Phase 2:* Streaming Markdown Text (AI Response).

### Technology Stack
* **Frontend:** Preact (via Vite) or Svelte.
    * *Constraint:* No heavy UI libraries (e.g., Material UI). use Tailwind or raw CSS.
* **Backend:** Python 3.10+ with **FastAPI**.
* **AI Model:** Google **Gemini 1.5 Flash** (via `google-generativeai`).
* **Scraping:** `BeautifulSoup4` (HTML parsing) + `httpx` (Async HTTP requests).
* **Deployment:** Vercel (Frontend) + Render/Railway (Backend).

---

## 3. Backend Specification (FastAPI)

### API Endpoint: `GET /process`

**Query Parameters:**
* `url` (string, required): The target university URL to compress.

**Processing Logic (Step-by-Step):**

1.  **Validation:** Check if `url` is valid. If not, return `400 Bad Request`.
2.  **Fetch Source:**
    * Use `httpx.AsyncClient` to fetch the `url`.
    * **Timeout:** Hard limit of 5 seconds.
    * *Metric Capture:* Record `Content-Length` (or body size) of the original response for the "Savings" calculation.
3.  **DOM Cleaning (BeautifulSoup):**
    * Remove tags: `<script>`, `<style>`, `<svg>`, `<img>`, `<video>`, `<iframe>`.
    * **Navigation Extraction:** Locate the primary `<nav>`, `header ul`, or sidebar. Extract text and hrefs into a JSON list.
    * **Content Extraction:** Extract the remaining text from `<body>` for the AI prompt.
4.  **AI Generation (Gemini 1.5 Flash):**
    * **Configuration:** `stream=True`, `max_output_tokens=2048`.
    * **System Prompt:**
      > "You are a bandwidth-saving assistant. Summarize the following web page content into concise markdown. Capture all dates, deadlines, and critical notifications. Do not hallucinate links. Format with clear headers. Output strictly Markdown."
5.  **Streaming Response:**
    * The endpoint must return a `StreamingResponse`.
    * **Chunk 1 (Metadata):** Send a JSON string containing the extracted Menu and the Original File Size.
    * **Chunk 2+ (Content):** Yield chunks of text directly from the Gemini stream.

### Data Model (JSON Structure for Chunk 1)
```json
{
  "meta": {
    "original_size_bytes": 2450000,
    "title": "University Home"
  },
  "navigation": [
    { "label": "Home", "link": "[https://uni.edu/](https://uni.edu/)" },
    { "label": "Courses", "link": "[https://uni.edu/courses](https://uni.edu/courses)" }
  ]
}

```
---

## 4. Frontend Specification (Preact/Svelte)

### UI/UX Requirements
* **Theme:** Minimalist "Reader Mode". High contrast (Black text on White bg).
* **Typography:** System Fonts only (San Francisco, Segoe UI, Roboto) to save bandwidth. **No Webfonts.**
* **Assets:** No raster images/icons. Use inline SVGs for UI elements (menu burger, back arrow).

### Component Structure
1.  **`TopBar`:**
    * Contains the URL input (or "Search" bar).
    * Displays the **"Data Saved" Badge** (Green pill component).
    * *Logic:* `(Original Size - Lite Size) / Original Size * 100` = % Saved.
2.  **`NavMenu`:**
    * Horizontal scrollable list or simple accordion.
    * Populated immediately upon receiving Chunk 1 from the backend.
3.  **`ContentArea`:**
    * Renders Markdown to HTML.
    * **Streaming Logic:** Must append text to the buffer as it arrives to ensure the user sees content instantly (Time To First Byte < 1s).

### State Management
* `isLoading`: Boolean (Toggles a CSS-only spinner).
* `streamBuffer`: String (Accumulates the AI response).
* `originalSize`: Number (From backend).
* `receivedSize`: Number (Tracked by client during download).

---

## 5. Error Handling Strategy

| Scenario | System Behavior | User Feedback |
| :--- | :--- | :--- |
| **Target Site Down** | Backend catches `httpx.RequestError`. | Display: "Could not reach university server." |
| **Timeout (>5s)** | Backend raises Timeout Exception. | Display: "Source site is too slow. Try again." |
| **AI Rate Limit** | Backend catches `429 Too Many Requests`. | **Fallback:** Display raw extracted text (non-summarized) using BS4. |
| **Invalid URL** | Frontend validation (RegEx). | Input field turns red; "Invalid URL". |

---

## 6. Testing Plan

### Unit Tests
* **Test Scraper:** Feed a sample HTML file (with known nav structure) to the parser and assert that the Menu JSON is generated correctly.
* **Test Prompt:** Ensure the system prompt text is injected correctly into the API call.

### Integration Tests
* **Mock Gemini:** Create a test mode that returns a dummy string ("This is a test summary...") instead of calling the real API to save quota during dev.
* **Latency Check:** Measure the time between "Request Sent" and "First Chunk Received". Target: < 800ms.

### Performance Benchmark (Lighthouse)
1.  Run the app on "Network Throttling: Slow 3G".
2.  **Verify:**
    * First Contentful Paint (FCP) < 1.5s.
    * Total Page Weight < 50KB (excluding the browser shell).
    * Accessibility Score > 90.

---

## 7. Implementation Roadmap (24h Sprint)

1.  **Setup (Hour 0-2):** Repo init, Vercel/Render project creation, Gemini API Key generation.
2.  **Backend Core (Hour 2-6):** Build FastAPI `process` endpoint. Implement BS4 scraping logic.
3.  **AI Integration (Hour 6-10):** Connect Gemini 1.5 Flash. Implement streaming generator.
4.  **Frontend Logic (Hour 10-16):** Build Preact app. Handle the streaming response parsing (separate JSON from Markdown).
5.  **UI & Polish (Hour 16-20):** Styling (CSS), "Data Saved" badge math, Service Worker for offline support.
6.  **Testing & Deployment (Hour 20-24):** Final bug fixes and live deployment.

---

## 8. Project Folder Structure (Monorepo)

For a hackathon, it is best to keep both frontend and backend in a single repository for easier management, even if you deploy them separately.

```text
/bandwidth-agnostic-pwa
│
├── /backend                 # FastAPI Application (Python)
│   ├── main.py              # Entry point & API routes
│   ├── requirements.txt     # Python dependencies (fastapi, uvicorn, google-generativeai, bs4)
│   ├── /services
│   │   ├── scraper.py       # Logic for BeautifulSoup navigation extraction
│   │   └── ai_engine.py     # Logic for Gemini API streaming
│   └── /utils
│       └── cleaner.py       # Helper functions to strip heavy HTML tags
│
├── /frontend                # Preact/Svelte Application (Node.js)
│   ├── package.json         # JS dependencies
│   ├── vite.config.js       # Build configuration
│   ├── /public              # Static assets (manifest.json, icons)
│   └── /src
│       ├── main.jsx         # App entry point
│       ├── /components
│       │   ├── TopBar.jsx   # Search bar & Data Saved badge
│       │   ├── NavMenu.jsx  # Scraped navigation list
│       │   └── Reader.jsx   # Markdown rendering component
│       └── /styles
│           └── global.css   # Minimalist CSS variables
│
├── .env.example             # Template for API keys (GEMINI_API_KEY)
├── .gitignore               # Standard git ignore (node_modules, venv, .env)
├── README.md                # Setup instructions
└── SPEC.md                  # This specification file

