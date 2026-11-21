from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from .models import Habit, HabitLog
from apps.gamification.services import award_xp

@transaction.atomic
def check_in_habit(habit_id: int, user) -> dict:
    habit = Habit.objects.select_for_update().get(id=habit_id, user=user)
    today = timezone.localdate()

    existing = HabitLog.objects.filter(habit=habit, log_date=today).first()
    if existing:
        return {'already_checked_in': True, 'xp_awarded': 0, 'habit_id': habit.id}

    habit.current_streak += 1
    habit.longest_streak = max(habit.longest_streak, habit.current_streak)
    habit.save(update_fields=['current_streak', 'longest_streak'])

    result = award_xp(
        user=user,
        base_amount=10,
        source_type='HABIT',
        source_id=f"HABIT_{habit.id}_{today}"
    )

    HabitLog.objects.create(
        habit=habit,
        user=user,
        log_date=today,
        xp_awarded=result['xp_awarded']
    )

    habit.refresh_from_db()
    from .serializers import HabitSerializer
    result['habit'] = HabitSerializer(habit).data
    result['habit_id'] = habit.id
    result['streak'] = habit.current_streak
    return result
