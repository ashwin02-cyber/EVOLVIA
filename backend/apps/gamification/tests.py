from django.test import TestCase
from django.utils import timezone
from apps.accounts.models import User, UserProfile
from apps.gamification.services import (
    calculate_level_from_xp,
    get_xp_needed_for_level,
    get_cumulative_xp_for_level,
    get_level_progress,
    get_rank_for_level,
    award_xp,
    claim_daily_login_reward
)
from apps.quests.models import Quest
from apps.quests.services import complete_quest

class GamificationEngineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test_player', email='test@evolvia.net', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, total_xp=0, level=1)

    def test_level_formula_boundaries(self):
        # SRS Section 16.2
        # need(L) = 250 * L
        self.assertEqual(get_xp_needed_for_level(1), 250)
        self.assertEqual(get_xp_needed_for_level(12), 3000)

        # cum(L) = 125 * L * (L - 1)
        self.assertEqual(get_cumulative_xp_for_level(1), 0)
        self.assertEqual(get_cumulative_xp_for_level(12), 16500)

        # Level 12 reference case: 18,950 total XP
        # In-level: 18,950 - 16,500 = 2,450
        # Progress: 2,450 / 3,000 = 81.67% -> 82%
        progress = get_level_progress(18950)
        self.assertEqual(progress['level'], 12)
        self.assertEqual(progress['xp_in_level'], 2450)
        self.assertEqual(progress['xp_needed'], 3000)
        self.assertEqual(progress['progress_pct'], 82)
        self.assertEqual(progress['rank'], 'Productivity Explorer')

    def test_rank_progression_ranges(self):
        # SRS Section 16.3
        self.assertEqual(get_rank_for_level(1), 'Quest Novice')
        self.assertEqual(get_rank_for_level(4), 'Quest Novice')
        self.assertEqual(get_rank_for_level(5), 'Apprentice')
        self.assertEqual(get_rank_for_level(9), 'Apprentice')
        self.assertEqual(get_rank_for_level(10), 'Productivity Explorer')
        self.assertEqual(get_rank_for_level(12), 'Productivity Explorer')
        self.assertEqual(get_rank_for_level(19), 'Productivity Explorer')
        self.assertEqual(get_rank_for_level(20), 'Quest Adept')
        self.assertEqual(get_rank_for_level(35), 'Strategist')
        self.assertEqual(get_rank_for_level(60), 'Evolved Master')

    def test_idempotent_quest_completion(self):
        # SRS Section 16.8
        quest = Quest.objects.create(
            user=self.user,
            title='Test Assignment',
            difficulty='HARD',
            xp_reward=100
        )

        res1 = complete_quest(quest.id, self.user)
        self.assertFalse(res1['already_completed'])
        self.assertGreater(res1['xp_awarded'], 0)
        self.user.profile.refresh_from_db()
        first_total = self.user.profile.total_xp

        # Second completion should return already_completed and 0 extra XP
        res2 = complete_quest(quest.id, self.user)
        self.assertTrue(res2['already_completed'])
        self.assertEqual(res2['xp_awarded'], 0)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.total_xp, first_total)

    def test_daily_login_reward_once_per_day(self):
        # SRS Section 16.4 & FR-060
        res1 = claim_daily_login_reward(self.user)
        self.assertEqual(res1['base_xp'], 50)

        # Claiming again on same day fails idempotently
        res2 = claim_daily_login_reward(self.user)
        self.assertTrue(res2.get('already_claimed'))
        self.assertEqual(res2.get('xp_awarded'), 0)
