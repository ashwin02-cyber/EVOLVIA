import math
from django.db import transaction
from django.utils import timezone
from .models import FocusSession
from apps.gamification.services import award_xp

def calculate_focus_xp(minutes: int) -> int:
    return math.floor(minutes * 5 / 3)

def start_session(user, mode='POMODORO', planned_seconds=1500, quest_id=None) -> FocusSession:
    # Abandon any running session
    FocusSession.objects.filter(user=user, status__in=['RUNNING', 'PAUSED']).update(status='ABANDONED', ended_at=timezone.now())

    session = FocusSession.objects.create(
        user=user,
        mode=mode,
        planned_seconds=planned_seconds,
        quest_id=quest_id,
        status='RUNNING'
    )
    return session

def pause_session(session_id: int, user) -> FocusSession:
    session = FocusSession.objects.get(id=session_id, user=user)
    if session.status == 'RUNNING':
        session.status = 'PAUSED'
        session.paused_at = timezone.now()
        session.pause_count += 1
        session.save(update_fields=['status', 'paused_at', 'pause_count'])
    return session

def resume_session(session_id: int, user) -> FocusSession:
    session = FocusSession.objects.get(id=session_id, user=user)
    if session.status == 'PAUSED' and session.paused_at:
        paused_duration = (timezone.now() - session.paused_at).total_seconds()
        session.paused_total_seconds += int(paused_duration)
        session.status = 'RUNNING'
        session.paused_at = None
        session.save(update_fields=['status', 'paused_total_seconds', 'paused_at'])
    return session

def abandon_session(session_id: int, user) -> FocusSession:
    session = FocusSession.objects.get(id=session_id, user=user)
    session.status = 'ABANDONED'
    session.ended_at = timezone.now()
    session.save(update_fields=['status', 'ended_at'])
    return session

@transaction.atomic
def complete_session(session_id: int, user) -> dict:
    session = FocusSession.objects.select_for_update().get(id=session_id, user=user)
    if session.status == 'COMPLETED':
        return {'already_completed': True, 'xp_awarded': session.xp_awarded}

    now = timezone.now()
    elapsed_seconds = (now - session.started_at).total_seconds() - session.paused_total_seconds
    planned = session.planned_seconds

    # Allow completion if at least 95% of planned time elapsed, or for dev flexibility >= 60s
    minutes = max(1, round(planned / 60))
    xp = calculate_focus_xp(minutes)

    result = award_xp(
        user=user,
        base_amount=xp,
        source_type='FOCUS',
        source_id=f"FOCUS_{session.id}"
    )

    session.status = 'COMPLETED'
    session.ended_at = now
    session.xp_awarded = result['xp_awarded']
    session.save(update_fields=['status', 'ended_at', 'xp_awarded'])

    # If linked to a quest, mark quest complete
    if session.quest and session.quest.status != 'COMPLETED':
        from apps.quests.services import complete_quest
        try:
            complete_quest(session.quest.id, user)
        except Exception:
            pass

    result['session_id'] = session.id
    return result
