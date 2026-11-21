from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User, UserProfile
from apps.gamification.services import (
    calculate_level_from_xp,
    get_xp_needed_for_level,
    get_cumulative_xp_for_level,
    get_level_progress,
    get_rank_for_level,
    award_xp,
    recalculate_streak
)
from apps.achievements.models import Achievement, UserAchievement
from apps.quests.models import Quest
from apps.quests.services import complete_quest

class GamificationEngineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='gamification_pro', email='game@evolvia.net', password='Password123')
        self.profile = UserProfile.objects.create(
            user=self.user,
            total_xp=0,
            level=1,
            current_streak=0,
            longest_streak=0,
            timezone='Asia/Kolkata'
        )

    def test_tc10_xp_calculation_by_difficulty(self):
        """TC-10: XP Calculation - Verify backend calculation for Easy, Medium, Hard, Epic."""
        diff_rewards = [
            ('EASY', 25),
            ('MEDIUM', 50),
            ('HARD', 100),
            ('EPIC', 150)
        ]

        for diff, expected_base in diff_rewards:
            quest = Quest.objects.create(user=self.user, title=f'{diff} Objective', difficulty=diff, xp_reward=expected_base)
            res = complete_quest(quest.id, self.user)
            self.assertEqual(res['base_xp'], expected_base)
            self.assertGreaterEqual(res['xp_awarded'], expected_base)

    def test_tc11_level_progression_thresholds(self):
        """TC-11: Level Progression - Verify exact formula need(L)=250*L, cum(L)=125*L*(L-1), and Level 12."""
        # Level 1 needs 250 XP
        self.assertEqual(get_xp_needed_for_level(1), 250)
        self.assertEqual(calculate_level_from_xp(0), 1)
        self.assertEqual(calculate_level_from_xp(249), 1)
        self.assertEqual(calculate_level_from_xp(250), 2)

        # Level 12 reference check: cumulative start at 16,500; need 3,000; total 18,950 -> in-level 2,450 (82%)
        self.assertEqual(get_cumulative_xp_for_level(12), 16500)
        self.assertEqual(get_xp_needed_for_level(12), 3000)
        info = get_level_progress(18950)
        self.assertEqual(info['level'], 12)
        self.assertEqual(info['xp_in_level'], 2450)
        self.assertEqual(info['xp_needed'], 3000)
        self.assertEqual(info['progress_pct'], 82)
        self.assertEqual(info['rank'], 'Productivity Explorer')

    def test_tc12_achievement_unlocking(self):
        """TC-12: Achievement Unlocking - Complete criteria, verify unlock and crystal bonus."""
        # Create achievement catalog entry
        ach = Achievement.objects.create(
            code='first_blood',
            name='First Blood',
            description='Complete your first quest.',
            criteria_text='1 quest completed',
            rule={'metric': 'quests_completed', 'gte': 1},
            xp_bonus=25,
            crystal_bonus=10
        )

        initial_crystals = self.profile.crystals
        # Complete 1 quest
        quest = Quest.objects.create(user=self.user, title='First Step', difficulty='EASY', xp_reward=25)
        res = complete_quest(quest.id, self.user)

        # Verify achievement unlocked
        self.assertTrue(UserAchievement.objects.filter(user=self.user, achievement=ach).exists())
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.crystals, initial_crystals + 10)

    def test_tc13_streak_calculation_across_days(self):
        """TC-13: Streak Calculation - Verify consecutive day activity and reset on missed day."""
        today = timezone.localdate()

        # Day 1: Activity yesterday
        self.profile.last_active_date = today - timedelta(days=1)
        self.profile.current_streak = 3
        self.profile.longest_streak = 5
        self.profile.save()

        # Trigger activity today -> streak increments to 4
        new_streak = recalculate_streak(self.user)
        self.assertEqual(new_streak, 4)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.current_streak, 4)

        # Trigger second activity today -> streak stays 4
        same_day_streak = recalculate_streak(self.user)
        self.assertEqual(same_day_streak, 4)

        # Simulate missing 2 days (gap)
        self.profile.last_active_date = today - timedelta(days=3)
        self.profile.save()

        # Activity today resets streak to 1
        reset_streak = recalculate_streak(self.user)
        self.assertEqual(reset_streak, 1)
