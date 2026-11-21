"""
Deterministic fallback AI service. Used when Gemini is unavailable.
Provides useful, context-aware responses without any external API.
"""
from datetime import datetime, timedelta

FALLBACK_RESPONSES = {
    'plan': (
        "Here's a structured plan based on your pending quests. I'll work through them "
        "in order of difficulty, starting with the most demanding while your focus is fresh."
    ),
    'prioritize': (
        "To prioritize effectively: tackle your highest-XP, highest-difficulty quest first "
        "when energy is peak. Save EASY quests for end-of-day wrap-up. "
        "Your streak rewards consistency — aim to complete at least one quest daily."
    ),
    'focus': (
        "For deep focus: use the Pomodoro technique (25 min work, 5 min break). "
        "Eliminate notifications. Set a clear quest objective before starting. "
        "The Focus Arena tracks your sessions and awards XP — use it!"
    ),
    'quest': (
        "Here are some quest suggestions based on your current level and pending workload. "
        "Each is designed to be completable in one focused session."
    ),
    'default': (
        "I'm Evo, your EVOLVIA productivity companion! I can help you plan your day, "
        "prioritize your quests, suggest focus strategies, and break large goals into "
        "manageable steps. What would you like to work on?"
    ),
}

FALLBACK_QUEST_SUGGESTIONS = [
    {'title': 'Deep Work Focus Session (45 min)', 'difficulty': 'MEDIUM', 'estimated_minutes': 45},
    {'title': 'Review and Organize Notes', 'difficulty': 'EASY', 'estimated_minutes': 20},
    {'title': 'Tackle Hardest Pending Task', 'difficulty': 'HARD', 'estimated_minutes': 60},
    {'title': 'Daily Habit Check-in', 'difficulty': 'EASY', 'estimated_minutes': 10},
    {'title': 'Practice Problem Set', 'difficulty': 'HARD', 'estimated_minutes': 45},
]

def classify_intent(message: str) -> str:
    """Simple keyword-based intent classification."""
    lower = message.lower()
    if any(w in lower for w in ['plan', 'schedule', 'day', 'today', 'organize']):
        return 'plan'
    if any(w in lower for w in ['priorit', 'important', 'first', 'urgent', 'order']):
        return 'prioritize'
    if any(w in lower for w in ['focus', 'distract', 'concentrat', 'pomodoro', 'work']):
        return 'focus'
    if any(w in lower for w in ['suggest', 'quest', 'task', 'add', 'create', 'new']):
        return 'quest'
    return 'default'

def fallback_chat(message: str, context: dict) -> dict:
    """Generate a useful fallback chat response from context."""
    intent = classify_intent(message)
    reply_prefix = FALLBACK_RESPONSES[intent]
    
    pending = context.get('pending_quests', [])
    suggestions = []
    
    if intent in ('plan', 'quest', 'prioritize') and pending:
        # Suggest top 3 pending quests from real context
        for q in pending[:3]:
            suggestions.append({
                'type': 'quest',
                'title': q['title'],
                'difficulty': q['difficulty'].upper(),
                'estimated_minutes': q.get('estimated_minutes', 30),
            })
        reply = f"{reply_prefix}\n\nBased on your current quest log, here's what I recommend:"
    elif intent in ('plan', 'quest') and not pending:
        suggestions = [
            {'type': 'quest', 'title': s['title'], 'difficulty': s['difficulty'], 'estimated_minutes': s['estimated_minutes']}
            for s in FALLBACK_QUEST_SUGGESTIONS[:3]
        ]
        reply = f"{reply_prefix}\n\nYour quest log is clear — here are some fresh objectives to add:"
    else:
        reply = reply_prefix
    
    return {
        'reply': reply,
        'mode': 'fallback',
        'suggestions': suggestions,
    }

def fallback_plan_day(available_minutes: int, context: dict) -> dict:
    """Generate a deterministic day plan from pending quests."""
    pending = context.get('pending_quests', [])
    
    # Sort by difficulty (EPIC > HARD > MEDIUM > EASY)
    priority_map = {'epic': 4, 'hard': 3, 'medium': 2, 'easy': 1}
    sorted_quests = sorted(pending, key=lambda q: priority_map.get(q['difficulty'], 2), reverse=True)
    
    blocks = []
    current_time = datetime(2000, 1, 1, 9, 0)  # Start at 09:00
    remaining = available_minutes
    block_id = 0
    
    for quest in sorted_quests:
        if remaining <= 0:
            break
        
        duration = min(quest.get('estimated_minutes', 30), remaining, 90)
        end_time = current_time + timedelta(minutes=duration)
        
        blocks.append({
            'start': current_time.strftime('%H:%M'),
            'end': end_time.strftime('%H:%M'),
            'title': quest['title'],
            'difficulty': quest['difficulty'].upper(),
            'estimated_minutes': duration,
            'is_break': False,
            'quest_id': None,
        })
        
        remaining -= duration
        current_time = end_time
        block_id += 1
        
        # Add break after every 45+ minute block
        if duration >= 45 and remaining > 15:
            break_end = current_time + timedelta(minutes=10)
            blocks.append({
                'start': current_time.strftime('%H:%M'),
                'end': break_end.strftime('%H:%M'),
                'title': 'Short Break',
                'difficulty': 'EASY',
                'estimated_minutes': 10,
                'is_break': True,
                'quest_id': None,
            })
            remaining -= 10
            current_time = break_end
    
    # If no pending quests, use defaults
    if not blocks:
        blocks = [
            {'start': '09:00', 'end': '09:45', 'title': 'Deep Work Focus Session', 'difficulty': 'HARD', 'estimated_minutes': 45, 'is_break': False, 'quest_id': None},
            {'start': '09:45', 'end': '10:00', 'title': 'Short Break', 'difficulty': 'EASY', 'estimated_minutes': 15, 'is_break': True, 'quest_id': None},
            {'start': '10:00', 'end': '10:30', 'title': 'Review & Organize Notes', 'difficulty': 'EASY', 'estimated_minutes': 30, 'is_break': False, 'quest_id': None},
        ]
    
    return {'blocks': blocks, 'mode': 'fallback'}
