from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from .models import Quest, QuestCompletion
from apps.gamification.services import award_xp

DIFFICULTY_XP_MAP = {
    'EASY': 25,
    'MEDIUM': 50,
    'HARD': 100,
    'EPIC': 150,
}

def calculate_xp_reward(difficulty: str, estimated_minutes: int = 30) -> int:
    return DIFFICULTY_XP_MAP.get(difficulty.upper(), 50)

def create_quest(user, **kwargs) -> Quest:
    difficulty = kwargs.get('difficulty', 'MEDIUM')
    estimated = kwargs.get('estimated_minutes', 30)
    xp_reward = calculate_xp_reward(difficulty, estimated)

    quest = Quest.objects.create(
        user=user,
        xp_reward=xp_reward,
        **kwargs
    )
    return quest

@transaction.atomic
def complete_quest(quest_id: int, user) -> dict:
    quest = Quest.objects.select_for_update().get(id=quest_id, user=user)

    # Idempotent return if already completed
    if quest.status == 'COMPLETED':
        return {
            'already_completed': True,
            'xp_awarded': 0,
            'quest_id': quest.id,
            'profile': {
                'total_xp': user.profile.total_xp,
                'level': user.profile.level,
            }
        }

    now = timezone.now()
    was_late = False
    if quest.due_at and now > quest.due_at:
        was_late = True

    quest.status = 'COMPLETED'
    quest.completed_at = now
    quest.save(update_fields=['status', 'completed_at', 'updated_at'])

    # Award XP through gamification engine
    result = award_xp(
        user=user,
        base_amount=quest.xp_reward,
        source_type='QUEST',
        source_id=f"QUEST_{quest.id}",
        late=was_late
    )

    QuestCompletion.objects.create(
        quest=quest,
        user=user,
        was_late=was_late,
        multiplier=result['multiplier'],
        xp_awarded=result['xp_awarded']
    )

    result['quest_id'] = quest.id
    return result

@transaction.atomic
def undo_complete_quest(quest_id: int, user) -> dict:
    quest = Quest.objects.select_for_update().get(id=quest_id, user=user)
    if quest.status != 'COMPLETED' or not quest.completed_at:
        return {'reverted': False, 'message': 'Quest is not completed'}

    # 5-minute undo window check
    if timezone.now() - quest.completed_at > timedelta(minutes=5):
        return {'reverted': False, 'message': 'Undo window expired'}

    completion = QuestCompletion.objects.filter(quest=quest, reversed_at__isnull=True).last()
    if completion:
        completion.reversed_at = timezone.now()
        completion.save(update_fields=['reversed_at'])

        # Reverse XP
        from apps.gamification.services import award_xp
        award_xp(user, base_amount=-completion.xp_awarded, source_type='REVERSAL', source_id=f"REVERSAL_{quest.id}")

    quest.status = 'TODO'
    quest.completed_at = None
    quest.save(update_fields=['status', 'completed_at', 'updated_at'])

    return {'reverted': True, 'quest_id': quest.id}
