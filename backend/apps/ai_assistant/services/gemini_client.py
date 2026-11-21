"""Reusable Gemini API client. Never exposes the key to callers."""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

def get_gemini_client():
    """Return a configured google.genai Client, or None if key is missing."""
    if not GEMINI_API_KEY:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        return client
    except Exception as e:
        logger.error(f"[EvoAI] Gemini client init failed: {e}")
        return None

def call_gemini(system_prompt: str, user_prompt: str, timeout: int = 10) -> Optional[str]:
    """
    Call Gemini with system + user prompt. Returns text or None on failure.
    Uses generate_content with Contents list for proper system/user separation.
    """
    client = get_gemini_client()
    if not client:
        return None

    try:
        from google.genai import types

        # Build the full prompt combining system + user context
        full_prompt = f"{system_prompt}\n\n---USER MESSAGE---\n{user_prompt}"

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1024,
                candidate_count=1,
            )
        )

        if response and response.text:
            return response.text.strip()
        return None

    except Exception as e:
        logger.warning(f"[EvoAI] Gemini call failed: {type(e).__name__}: {e}")
        return None

def is_gemini_available() -> bool:
    """Check if Gemini is configured and likely available."""
    return bool(GEMINI_API_KEY)
