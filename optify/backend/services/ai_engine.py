import google.generativeai as genai
from typing import AsyncIterator
import os
from dotenv import load_dotenv
import asyncio

# Load API key
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# --- CONFIGURATION ---
# PRIMARY: Gemini 2.5 Flash Lite (Your main model)
PRIMARY_MODEL_NAME = 'gemini-2.5-flash-lite'

# FALLBACK: Gemma 3 12B (Your safety net)
FALLBACK_MODEL_NAME = 'gemma-3-12b-it'

SYSTEM_PROMPT = """You are a bandwidth-saving assistant. Summarize the following web page content into concise markdown. 

Requirements:
- Capture all dates, deadlines, and critical notifications.
- Do not hallucinate links.
- Format with clear headers (##, ###).
- Keep the summary under 2000 words.
- Output strictly in Markdown format.
- Preserve important numerical data and statistics.
- If content is already concise, format it clearly rather than shortening.

Content to summarize:"""


async def summarize_content(text_content: str) -> AsyncIterator[str]:
    """
    Streams the summary.
    CRITICAL FEATURE: If ANY text is successfully streamed, all subsequent errors
    are suppressed. This prevents "Error: 429" from appearing at the bottom of a
    completed summary.
    """

    generation_config = {
        'max_output_tokens': 2048,
        'temperature': 0.3,
    }

    full_prompt = f"{SYSTEM_PROMPT}\n\n{text_content}"

    # Track if we have sent any data to the user
    has_sent_content = False

    # 1. Try Primary Model
    try:
        model = genai.GenerativeModel(PRIMARY_MODEL_NAME)
        response = await model.generate_content_async(
            full_prompt,
            generation_config=generation_config,
            stream=True
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text
                has_sent_content = True

    except Exception as primary_error:
        # 2. If Primary fails, try Fallback
        print(f"Primary AI failed: {primary_error}. Switching to fallback...")

        try:
            # Only notify about the switch if we haven't started streaming yet
            if not has_sent_content:
                yield f"\n\n*(Note: Switched to backup model due to high traffic)*\n\n"

            model = genai.GenerativeModel(FALLBACK_MODEL_NAME)
            response = await model.generate_content_async(
                full_prompt,
                generation_config=generation_config,
                stream=True
            )

            async for chunk in response:
                try:
                    if chunk.text:
                        yield chunk.text
                        has_sent_content = True
                except Exception:
                    # If a specific chunk fails, ignore it
                    continue

        except Exception as fallback_error:
            # 3. Final Decision
            print(f"Fallback AI failed: {fallback_error}")

            # THE FIX: Only show the error if the user has received NOTHING.
            # If they got a summary (even a partial one), we stay silent.
            if not has_sent_content:
                yield f"\n\n*AI Summarization unavailable. The server is busy.*"


def format_raw_text(text_content: str) -> str:
    header = "## Page Content (Raw)\n\n"
    return header + text_content[:5000].replace('\n', '\n\n')