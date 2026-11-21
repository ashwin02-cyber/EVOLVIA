import math
from datetime import date, timedelta
from django.db import transaction
from django.utils import timezone
from .models import XPTransaction, UserLevel, LoginReward
from apps.accounts.models import UserProfile

def get_xp_needed_for_level(level: int) -> int:
    return 250 * level

def get_cumulative_xp_for_level(level: int) -> int:
    return 125 * level * (level - 1)

def calculate_level_from_xp(total_xp: int) -> int:
    if total_xp <= 0:
        return 1
    lvl = int((1 + math.isqrt(1 + (4 * total_xp) // 125)) // 2)
    return min(max(1, lvl), 100)

def get_rank_for_level(level: int) -> str:
    if level <= 4:
        return 'Quest Novice'
    if level <= 9:
        return 'Apprentice'
    if level <= 19:
        return 'Productivity Explorer'
    if level <= 34:
        return 'Quest Adept'
    if level <= 59:
        return 'Strategist'
    return 'Evolved Master'

def get_level_progress(total_xp: int) -> dict:
    level = calculate_level_from_xp(total_xp)
    cum_current = get_cumulative_xp_for_level(level)
    xp_in_level = max(0, total_xp - cum_current)
    xp_needed = get_xp_needed_for_level(level)
    progress_pct = min(100, round((xp_in_level / xp_needed) * 100))

    return {
        'level': level,
        'total_xp': total_xp,
        'xp_in_level': xp_in_level,
        'xp_needed': xp_needed,
        'progress_pct': progress_pct,
        'rank': get_rank_for_level(level)
    }

@transaction.atomic
def award_xp(user, base_amount: int, source_type: str, source_id: str, late: bool = False) -> dict:
    profile, _ = UserProfile.objects.select_for_update().get_or_create(user=user)

    # Calculate streak multiplier for quests and focus
    streak_multiplier = 1.0
    if source_type in ['QUEST', 'FOCUS']:
        streak_multiplier = 1.0 + 0.02 * min(profile.current_streak, 10)

    late_factor = 0.5 if late else 1.0
    amount = math.floor(base_amount * late_factor * streak_multiplier)

    old_level = profile.level
    new_total_xp = max(0, profile.total_xp + amount)
    new_level = calculate_level_from_xp(new_total_xp)
    new_rank = get_rank_for_level(new_level)

    level_up_payload = None
    if new_level > old_level:
        crystals_awarded = (new_level - old_level) * 5
        profile.crystals += crystals_awarded
        level_up_payload = {
            'from': old_level,
            'to': new_level,
            'rank': new_rank,
            'rank_changed': new_rank != get_rank_for_level(old_level),
            'crystals_awarded': crystals_awarded
        }
        UserLevel.objects.get_or_create(
            user=user,
            level=new_level,
            defaults={'rank': new_rank, 'xp_at_reach': new_total_xp}
        )

    profile.total_xp = new_total_xp
    profile.level = new_level
    profile.title_tagline = new_rank
    profile.save(update_fields=['total_xp', 'level', 'title_tagline', 'crystals', 'updated_at'])

    # Ledger entry
    tx = XPTransaction.objects.create(
        user=user,
        amount=amount,
        base_amount=base_amount,
        multiplier=streak_multiplier,
        source_type=source_type,
        source_id=str(source_id),
        balance_after=new_total_xp,
        level_after=new_level
    )

    progress = get_level_progress(new_total_xp)

    # Recalculate streak
    recalculate_streak(user)

    # Check achievements
    from apps.achievements.services import evaluate_achievements
    unlocked_achievements = evaluate_achievements(user, source_type)

    return {
        'xp_awarded': amount,
        'base_xp': base_amount,
        'multiplier': float(streak_multiplier),
        'already_completed': False,
        'profile': {
            'total_xp': new_total_xp,
            'level': new_level,
            'xp_in_level': progress['xp_in_level'],
            'xp_needed': progress['xp_needed'],
            'progress_pct': progress['progress_pct'],
            'rank': new_rank,
            'current_streak': profile.current_streak,
        },
        'level_up': level_up_payload,
        'achievements_unlocked': unlocked_achievements
    }

def recalculate_streak(user):
    profile = user.profile
    today = timezone.localdate()

    # Check if user had activity today
    if profile.last_active_date == today:
        return profile.current_streak

    if profile.last_active_date == today - timedelta(days=1):
        profile.current_streak += 1
    elif profile.last_active_date is None or profile.last_active_date < today - timedelta(days=1):
        profile.current_streak = 1

    profile.longest_streak = max(profile.longest_streak, profile.current_streak)
    profile.last_active_date = today
    profile.save(update_fields=['current_streak', 'longest_streak', 'last_active_date'])
    return profile.current_streak

@transaction.atomic
def claim_daily_login_reward(user) -> dict:
    today = timezone.localdate()
    existing = LoginReward.objects.filter(user=user, claim_date=today).first()
    if existing:
        return {'already_claimed': True, 'xp_awarded': 0}

    LoginReward.objects.create(user=user, claim_date=today, xp_awarded=50)
    result = award_xp(user, base_amount=50, source_type='LOGIN', source_id=f"LOGIN_{today}")
    return result
