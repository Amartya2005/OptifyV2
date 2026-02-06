# Build Plan: Bandwidth-Agnostic Middleware (PS3)

**Methodology:** "Tracer Bullet" Development.
**Goal:** Build a complete, end-to-end path through the system (Backend -> Mock Stream -> Frontend) before adding complex logic (Real AI, complex scraping). This ensures the architecture holds up before introducing external API variables.

---

## Phase 1: The Blueprint

### 1. Project Initialization & Skeleton
**Goal:** Establish the Monorepo structure, install dependencies, and get "Hello World" running on both Frontend and Backend.
* **Step 1.1:** Create directory structure and Python venv.
* **Step 1.2:** Setup FastAPI (Backend) with a basic health check.
* **Step 1.3:** Setup Preact/Vite (Frontend) with a basic landing page.

### 2. Backend: Core Logic (The Scraper)
**Goal:** Implement the logic to fetch a URL, strip the junk, and extract navigation *without* AI yet.
* **Step 2.1:** Create `cleaner.py` and `scraper.py`. Implement BeautifulSoup logic to strip tags and extract `<nav>`.
* **Step 2.2:** Write Unit Tests for the scraper using a local HTML string.

### 3. Backend: The Mock Stream (Crucial Step)
**Goal:** Implement the specific streaming protocol (Phase 1 JSON -> Phase 2 Text) using dummy data.
* **Step 3.1:** Create the `GET /process` endpoint.
* **Step 3.2:** Implement a generator that yields a JSON string first, then yields dummy Markdown text chunks.
* **Step 3.3:** Test this endpoint with `curl` to verify the streaming format.

### 4. Frontend: The Stream Consumer
**Goal:** Build the client-side logic to consume the stream, detect the JSON header, and render the rest as text.
* **Step 4.1:** Build the `TopBar` (Search) and `NavMenu` components.
* **Step 4.2:** Implement the `fetch` logic using `TextDecoder` to read the stream.
* **Step 4.3:** Implement logic to split the first incoming chunk to separate the JSON object from the Markdown body.

### 5. Backend: Gemini Integration
**Goal:** Replace the dummy text generator with the real Gemini 1.5 Flash stream.
* **Step 5.1:** Configure `google-generativeai`.
* **Step 5.2:** Update `GET /process` to feed the scraped body text into Gemini.
* **Step 5.3:** Chain the Gemini stream into the existing FastAPI streaming response.

### 6. Polish & UI
**Goal:** Apply the "Reader Mode" styling and "Data Saved" logic.
* **Step 6.1:** Implement Markdown rendering (using `marked` or similar).
* **Step 6.2:** Apply minimalist CSS (High contrast, system fonts).
* **Step 6.3:** Calculate and display the Data Savings percentage.

---

## Phase 2: Execution Prompts

Copy and paste these prompts sequentially into a Coding LLM (Claude 3.5 Sonnet, GPT-4o, etc.) to generate the code.

### Prompt 1: Project Setup & Monorepo Structure

```text
You are an expert Full Stack Developer using Python FastAPI and Preact (Vite).

I need to initialize a Monorepo for a project called "bandwidth-agnostic-pwa".
Please generate the shell commands and file content to set up the following structure:

/bandwidth-agnostic-pwa
│
├── /backend                 # FastAPI
│   ├── main.py              # Contains a basic GET /health endpoint returning {"status": "ok"}
│   ├── requirements.txt     # Add: fastapi, uvicorn, httpx, beautifulsoup4, google-generativeai
│   └── /services            # Empty folder
│
├── /frontend                # Preact
│   # (Assume I will run 'npm create vite@latest frontend -- --template preact' myself,
│   # but give me the instructions to clean up the boiler plate)
│   # Create a basic App.jsx that displays "PS3 Middleware Ready"
│
└── .gitignore               # Standard python/node ignore

Instructions:
1. Provide the bash commands to create folders and the python virtual environment.
2. Provide the content for `backend/main.py`.
3. Provide the content for a `run_dev.sh` script in the root that runs the backend on port 8000.

```
---
### Prompt 2: Backend Scraper Service (TDD)

```text
Focus: Backend / BeautifulSoup4

I need a robust HTML scraping service.
Create two files in `backend/services`: `cleaner.py` and `scraper.py`.
Create a test file `backend/tests/test_scraper.py`.

Requirements:
1. `cleaner.py`: A function `clean_html(html_content)` that:
   - Removes <script>, <style>, <svg>, <img>, <video>, <iframe> tags.
   - Returns the cleaned HTML string.

2. `scraper.py`: A function `extract_data(html_content)` that:
   - Uses `cleaner.py` first.
   - Locates the first `<nav>` or `<header>` element. Extracts links as a list of dicts: `[{ "label": "Text", "link": "href" }]`.
   - Extracts the remaining text content from the `<body>` to serve as the "Main Content".
   - Returns a dictionary: `{"navigation": [...], "main_content": "..."}`.

3. `test_scraper.py`:
   - Define a raw HTML string with some junk tags, a nav bar, and some body text.
   - Assert that scripts are removed.
   - Assert that navigation is extracted correctly.

Provide the code for all three files. Run the tests mentally to ensure they pass.

```
---
### Prompt 3: The "Mock" Streaming Endpoint

```text
Focus: Backend / FastAPI Streaming

We need to implement the core API endpoint `GET /process`.
For now, we will MOCK the AI generation to ensure our streaming protocol works.

In `backend/main.py`:

1. Import `extract_data` from `services.scraper`.
2. Create an endpoint `GET /process` that accepts a `url` query parameter.
3. Use `httpx` to fetch the URL (with a 5s timeout). Handle errors (return 400 if invalid).
4. Calculate `original_size` (Content-Length).
5. Run `extract_data` on the HTML.
6. **Streaming Logic:**
   - The response must be a `StreamingResponse`.
   - **Chunk 1:** Immediately yield a JSON string followed by a newline.
     Format: `{"meta": {"original_size": 12345, "title": "Page Title"}, "navigation": [...]}\n`
   - **Chunk 2+:** Simulate AI generation. Yield the "main_content" text extracted from the scraper in small chunks (e.g., 50 characters) with a slight delay (0.05s) to simulate a typewriter effect.

Provide the updated `backend/main.py` code.

```
---
