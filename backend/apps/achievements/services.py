from .models import Achievement, UserAchievement

def evaluate_achievements(user, event_type: str = '') -> list:
    unlocked_now = []
    profile = getattr(user, 'profile', None)
    if not profile:
        return []

    # Get user metrics
    quests_completed = user.quests.filter(status='COMPLETED').count()
    focus_completed = user.focus_sessions.filter(status='COMPLETED').count()
    streak = profile.longest_streak
    level = profile.level

    # Catalog to test
    catalog = Achievement.objects.filter(is_active=True)
    existing_codes = set(
        UserAchievement.objects.filter(user=user).values_list('achievement__code', flat=True)
    )

    for ach in catalog:
        if ach.code in existing_codes:
            continue

        rule = ach.rule or {}
        metric = rule.get('metric')
        gte = rule.get('gte', 1)

        matched = False
        if metric == 'quests_completed' and quests_completed >= gte:
            matched = True
        elif metric == 'streak' and streak >= gte:
            matched = True
        elif metric == 'focus_sessions' and focus_completed >= gte:
            matched = True
        elif metric == 'level' and level >= gte:
            matched = True

        if matched:
            UserAchievement.objects.create(user=user, achievement=ach)
            # Award bonus crystals
            profile.crystals += ach.crystal_bonus
            profile.save(update_fields=['crystals'])

            unlocked_now.append({
                'code': ach.code,
                'name': ach.name,
                'xp_bonus': ach.xp_bonus,
                'crystal_bonus': ach.crystal_bonus,
                'rarity': ach.rarity
            })

    return unlocked_now
