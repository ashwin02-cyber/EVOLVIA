"""
Build context for Gemini from the authenticated user.
Only sends what the SRS privacy requirement permits:
- Current level
- Current streak
- Pending quest titles + difficulties
"""
from apps.quests.models import Quest

def build_user_context(user) -> dict:
    """
    Returns minimal safe context dict. Never includes email, password, tokens.
    """
    profile = getattr(user, 'profile', None)

    level = profile.level if profile else 1
    streak = profile.current_streak if profile else 0

    # Only pending (non-completed) quests, non-deleted
    pending_quests = Quest.objects.filter(
        user=user,
        status__in=['TODO', 'IN_PROGRESS'],
        deleted_at__isnull=True
    ).order_by('-xp_reward')[:10]  # max 10

    pending_list = [
        {
            'title': q.title,
            'difficulty': q.difficulty.lower(),
            'estimated_minutes': q.estimated_minutes or 30,
            'xp_reward': q.xp_reward,
        }
        for q in pending_quests
    ]

    return {
        'level': level,
        'streak': streak,
        'pending_quests': pending_list,
    }

def context_to_prompt_string(ctx: dict) -> str:
    """Format context dict as a readable string for the system prompt."""
    lines = [
        "USER CONTEXT (trusted backend data):",
        f"- Level: {ctx['level']}",
        f"- Current streak: {ctx['streak']} days",
    ]

    if ctx['pending_quests']:
        lines.append(f"- Pending quests ({len(ctx['pending_quests'])}):")
        for q in ctx['pending_quests']:
            lines.append(f"  * {q['title']} [{q['difficulty']}] (~{q['estimated_minutes']}min, {q['xp_reward']}XP)")
    else:
        lines.append("- No pending quests currently.")

    return "\n".join(lines)
