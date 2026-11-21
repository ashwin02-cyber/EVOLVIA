from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.habits.models import Habit
from apps.habits.services import check_in_habit
from apps.focus.models import FocusSession
from apps.focus.services import start_session, complete_session

class FullStackWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='cyber_tester', email='tester@evolvia.net', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, total_xp=1000, level=4)
        self.client.force_authenticate(user=self.user)

    def test_auth_login_api(self):
        anon_client = APIClient()
        res = anon_client.post('/api/v1/auth/login/', {'identifier': 'cyber_tester', 'password': 'password123'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_dashboard_aggregate_endpoint(self):
        res = self.client.get('/api/v1/dashboard/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('profile', res.data)
        self.assertIn('today', res.data)
        self.assertIn('focus', res.data)
        self.assertIn('progress', res.data)
        self.assertIn('active_questline', res.data)

    def test_habit_checkin_and_streak(self):
        habit = Habit.objects.create(user=self.user, name='Early Standup Protocol')
        res1 = check_in_habit(habit.id, self.user)
        self.assertEqual(res1['xp_awarded'], 10)
        self.assertEqual(res1['streak'], 1)

        # Second check-in on same day should be idempotent
        res2 = check_in_habit(habit.id, self.user)
        self.assertTrue(res2.get('already_checked_in'))
        self.assertEqual(res2['xp_awarded'], 0)

    def test_focus_session_flow(self):
        session = start_session(user=self.user, mode='POMODORO', planned_seconds=1500)
        self.assertEqual(session.status, 'RUNNING')

        result = complete_session(session.id, self.user)
        self.assertGreater(result['xp_awarded'], 0)
        session.refresh_from_db()
        self.assertEqual(session.status, 'COMPLETED')
