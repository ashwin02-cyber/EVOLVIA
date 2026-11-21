"""Main chat service — tries Gemini first, falls back deterministically."""
import logging
import re
from .gemini_client import call_gemini, is_gemini_available
from .context_builder import build_user_context, context_to_prompt_string
from .fallback_service import fallback_chat
from .response_validator import validate_chat_reply, validate_suggestion
from .prompts import EVO_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def extract_suggestions_from_reply(reply: str) -> list:
    """
    Try to extract structured quest suggestions from a free-text Gemini reply.
    Looks for lines like: - Title [DIFFICULTY] (~Xmin)
    """
    suggestions = []
    # Pattern: "- Task name [HARD] (~45min)"
    pattern = re.compile(
        r'[-*\u2022]\s*(.+?)\s*\[(EASY|MEDIUM|HARD|EPIC)\](?:\s*\(~?(\d+)\s*min\))?',
        re.IGNORECASE
    )
    for match in pattern.finditer(reply):
        title = match.group(1).strip()
        difficulty = match.group(2).upper()
        minutes = int(match.group(3)) if match.group(3) else 30
        if title and len(title) <= 200:
            suggestions.append({
                'type': 'quest',
                'title': title,
                'difficulty': difficulty,
                'estimated_minutes': minutes,
            })
    return suggestions[:5]  # max 5 suggestions

def chat_with_evo(user, message: str) -> dict:
    """
    Main entry: chat with Evo AI. Returns standardized response dict.
    """
    # Validate message length
    message = message.strip()[:1000]
    if not message:
        return {'reply': 'Please send a message.', 'mode': 'fallback', 'suggestions': []}
    
    # Build user context
    context = build_user_context(user)
    context_str = context_to_prompt_string(context)
    
    if is_gemini_available():
        # Build full system prompt with dynamic context
        system_prompt = f"{EVO_SYSTEM_PROMPT}\n\n{context_str}"
        
        reply_text = call_gemini(system_prompt=system_prompt, user_prompt=message)
        
        if reply_text:
            reply = validate_chat_reply(reply_text)
            suggestions = extract_suggestions_from_reply(reply)
            return {
                'reply': reply,
                'mode': 'gemini',
                'suggestions': suggestions,
            }
        else:
            logger.warning("[EvoAI] Gemini returned empty response, using fallback")
    
    # Fallback
    return fallback_chat(message, context)
