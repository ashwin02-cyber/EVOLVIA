"""Validate and sanitize AI-generated responses."""
import json
import re
import logging

logger = logging.getLogger(__name__)

VALID_DIFFICULTIES = {'EASY', 'MEDIUM', 'HARD', 'EPIC'}

def validate_chat_reply(text: str) -> str:
    """Sanitize a chat reply — strip any HTML/JS, truncate if needed."""
    if not text:
        return ''
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', '', text)
    # Truncate to 2000 chars
    return clean[:2000].strip()

def validate_suggestion(s: dict) -> dict | None:
    """Validate a single quest suggestion dict. Returns None if invalid."""
    title = str(s.get('title', '')).strip()
    if not title or len(title) > 200:
        return None
    
    difficulty = str(s.get('difficulty', 'MEDIUM')).upper()
    if difficulty not in VALID_DIFFICULTIES:
        difficulty = 'MEDIUM'
    
    estimated = s.get('estimated_minutes', 30)
    try:
        estimated = max(5, min(int(estimated), 480))
    except (TypeError, ValueError):
        estimated = 30
    
    return {
        'type': 'quest',
        'title': title,
        'difficulty': difficulty,
        'estimated_minutes': estimated,
    }

def parse_plan_from_text(text: str) -> list:
    """
    Try to extract a JSON plan array from Gemini response text.
    Handles cases where Gemini wraps the JSON in markdown.
    """
    if not text:
        return []
    
    # Strip markdown code fences
    clean = re.sub(r'```(?:json)?\s*', '', text)
    clean = re.sub(r'```\s*', '', clean)
    clean = clean.strip()
    
    # Find JSON array
    start = clean.find('[')
    end = clean.rfind(']')
    if start == -1 or end == -1:
        return []
    
    try:
        raw = json.loads(clean[start:end+1])
        return [b for b in (validate_plan_block(item) for item in raw) if b]
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"[EvoAI] Failed to parse plan JSON: {e}")
        return []

def validate_plan_block(block: dict) -> dict | None:
    """Validate a single plan block from Gemini."""
    if not isinstance(block, dict):
        return None
    
    start = str(block.get('start', '')).strip()
    end = str(block.get('end', '')).strip()
    title = str(block.get('title', '')).strip()
    
    if not start or not end or not title:
        return None
    
    # Validate time format HH:MM
    time_re = re.compile(r'^\d{1,2}:\d{2}$')
    if not time_re.match(start) or not time_re.match(end):
        return None
    
    difficulty = str(block.get('difficulty', 'MEDIUM')).upper()
    if difficulty not in VALID_DIFFICULTIES:
        difficulty = 'MEDIUM'
    
    estimated = block.get('estimated_minutes', 30)
    try:
        estimated = max(5, min(int(estimated), 480))
    except (TypeError, ValueError):
        estimated = 30
    
    is_break = bool(block.get('is_break', False))
    
    return {
        'start': start,
        'end': end,
        'title': title[:200],
        'difficulty': difficulty,
        'estimated_minutes': estimated,
        'is_break': is_break,
        'quest_id': None,  # never trust AI-provided IDs
    }
