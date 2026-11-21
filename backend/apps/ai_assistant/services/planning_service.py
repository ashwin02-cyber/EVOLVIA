"""Plan My Day service — generates time-blocked schedules."""
import logging
from .gemini_client import call_gemini, is_gemini_available
from .context_builder import build_user_context, context_to_prompt_string
from .fallback_service import fallback_plan_day
from .response_validator import parse_plan_from_text
from .prompts import PLAN_DAY_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def plan_day_for_user(user, available_minutes: int, focus_areas: list = None) -> dict:
    """Generate a day plan. Returns {'blocks': [...], 'mode': str}."""
    
    available_minutes = max(30, min(int(available_minutes), 480))
    context = build_user_context(user)
    context_str = context_to_prompt_string(context)
    
    focus_str = ''
    if focus_areas:
        focus_str = f"\nFocus areas requested: {', '.join(focus_areas[:5])}"
    
    if is_gemini_available():
        system_prompt = f"{PLAN_DAY_SYSTEM_PROMPT}\n\n{context_str}"
        user_prompt = (
            f"Generate a day plan with {available_minutes} minutes total available.{focus_str}\n"
            f"Prioritize the pending quests from context. Return ONLY a JSON array of blocks."
        )
        
        response_text = call_gemini(system_prompt=system_prompt, user_prompt=user_prompt)
        
        if response_text:
            blocks = parse_plan_from_text(response_text)
            if blocks:
                logger.info(f"[EvoAI] Gemini plan generated: {len(blocks)} blocks")
                return {'blocks': blocks, 'mode': 'gemini'}
            else:
                logger.warning("[EvoAI] Gemini plan parse failed, falling back")
        else:
            logger.warning("[EvoAI] Gemini plan empty response, falling back")
    
    return fallback_plan_day(available_minutes, context)
