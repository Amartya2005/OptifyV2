import httpx
import asyncio

# Configuration
FETCH_TIMEOUT = 10.0  # seconds
MAX_CONTENT_SIZE = 5 * 1024 * 1024  # 5MB limit

# --- NEW: Pretend to be a real browser ---
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


async def fetch_url(url: str) -> dict:
    """
    Asynchronously fetches a URL and returns response details.
    """
    # Disable SSL verification for broader compatibility (verify=False)
    async with httpx.AsyncClient(follow_redirects=True, verify=False) as client:
        try:
            # --- UPDATE: Pass the headers here ---
            response = await client.get(url, headers=HEADERS, timeout=FETCH_TIMEOUT)
            response.raise_for_status()

            content_length = response.headers.get("content-length")
            if content_length and int(content_length) > MAX_CONTENT_SIZE:
                raise ValueError("Content too large")

            return {
                "content": response.text,
                "status_code": response.status_code,
                "content_length": len(response.content),
                "headers": dict(response.headers)
            }
        except httpx.TimeoutException:
            raise httpx.TimeoutException("Request timed out")
        except httpx.RequestError as e:
            raise httpx.RequestError(f"Request failed: {str(e)}")