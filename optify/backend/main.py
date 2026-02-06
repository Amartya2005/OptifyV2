import json
import logging
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx

# Import custom modules
from utils.cleaner import is_valid_url, normalize_url, clean_html, extract_text_content
from services.scraper import extract_navigation
from services import fetch_url
from services.ai_engine import summarize_content, format_raw_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bandwidth-Agnostic Middleware")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


async def stream_response(url: str) -> AsyncIterator[str]:
    try:
        # --- PHASE 1: Fetch ---
        logger.info(f"Fetching: {url}")
        try:
            result = await fetch_url(url)
        except httpx.TimeoutException:
            yield json.dumps({"error": "Timeout - Source site is too slow."})
            return
        except Exception as e:
            yield json.dumps({"error": f"Connection failed: {str(e)}"})
            return

        soup = clean_html(result['content'])
        navigation = extract_navigation(soup, url)
        text_content = extract_text_content(soup)

        metadata = {
            "meta": {
                "original_size_bytes": result['content_length'],
                "title": soup.title.string if soup.title else "Compressed Page",
                "url": url
            },
            "navigation": navigation
        }

        yield json.dumps(metadata) + "\n---SEPARATOR---\n"

        # --- PHASE 2: AI ---
        print("DEBUG: Metadata sent. Starting AI stream...")  # Check console for this!

        if len(text_content) < 500:
            yield format_raw_text(text_content)
        else:
            try:
                # Async loop matches Async Engine
                async for chunk in summarize_content(text_content):
                    yield chunk
            except Exception as e:
                logger.error(f"AI Stream Error: {e}")
                yield format_raw_text(text_content)

    except Exception as e:
        logger.error(f"General Stream Error: {e}")
        yield f"\n\n*Critical Error: {str(e)}*"


@app.get("/process")
async def process_endpoint(url: str):
    normalized_url = normalize_url(url)
    if not is_valid_url(normalized_url):
        raise HTTPException(status_code=400, detail="Invalid URL provided")

    return StreamingResponse(
        stream_response(normalized_url),
        media_type="text/plain"
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)