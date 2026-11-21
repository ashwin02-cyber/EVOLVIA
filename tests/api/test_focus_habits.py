from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.focus.models import FocusSession
from apps.focus.services import start_session, pause_session, resume_session, complete_session
from apps.habits.models import Habit, HabitLog
from apps.habits.services import check_in_habit

class FocusAndHabitsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='zen_master', email='zen@evolvia.net', password='Password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Zen Master', total_xp=500, level=2)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_tc14_focus_timer_lifecycle(self):
        """TC-14: Focus Timer - Start, pause, resume, complete and verify XP award."""
        session = start_session(user=self.user, mode='POMODORO', planned_seconds=1500)
        self.assertEqual(session.status, 'RUNNING')
        self.assertEqual(session.planned_seconds, 1500)

        # Pause
        paused = pause_session(session.id, self.user)
        self.assertEqual(paused.status, 'PAUSED')
        self.assertEqual(paused.pause_count, 1)

        # Resume
        resumed = resume_session(session.id, self.user)
        self.assertEqual(resumed.status, 'RUNNING')

        # Complete
        initial_xp = self.profile.total_xp
        result = complete_session(session.id, self.user)
        self.assertGreater(result['xp_awarded'], 0)
        session.refresh_from_db()
        self.assertEqual(session.status, 'COMPLETED')
        self.profile.refresh_from_db()
        self.assertGreater(self.profile.total_xp, initial_xp)

    def test_tc15_focus_session_persistence(self):
        """TC-15: Focus Session Persistence - Active session is retrievable via GET /focus/sessions/active/."""
        session = start_session(user=self.user, mode='DEEP_WORK', planned_seconds=3000)

        # Query active session endpoint (simulating browser reload / reconnection)
        res = self.client.get('/api/v1/focus/sessions/active/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['id'], session.id)
        self.assertEqual(res.data['mode'], 'DEEP_WORK')
        self.assertEqual(res.data['status'], 'RUNNING')

    def test_tc16_habit_checkin_persistence_and_xp(self):
        """TC-16: Habit Check-in - Check in for today, verify streak increment and +10 XP."""
        habit = Habit.objects.create(user=self.user, name='Read Technical Papers')
        initial_xp = self.profile.total_xp

        result = check_in_habit(habit.id, self.user)
        self.assertEqual(result['xp_awarded'], 10)
        self.assertEqual(result['streak'], 1)

        # Verify DB log
        self.assertTrue(HabitLog.objects.filter(habit=habit, user=self.user).exists())
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.total_xp, initial_xp + 10)

    def test_tc17_duplicate_habit_checkin_prevention(self):
        """TC-17: Duplicate Habit Check-in - Second check-in on same day awards 0 additional XP."""
        habit = Habit.objects.create(user=self.user, name='Daily LeetCode Problem')

        # First check-in
        res1 = check_in_habit(habit.id, self.user)
        self.assertEqual(res1['xp_awarded'], 10)
        self.profile.refresh_from_db()
        first_total = self.profile.total_xp

        # Second check-in
        res2 = check_in_habit(habit.id, self.user)
        self.assertTrue(res2.get('already_checked_in'))
        self.assertEqual(res2['xp_awarded'], 0)

        # Verify balance unchanged
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.total_xp, first_total)
