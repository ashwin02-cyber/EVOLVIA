import unittest
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.habits.models import Habit
from apps.achievements.models import Achievement

class EndToEndUserJourneyTests(TestCase):
    def test_tc30_complete_user_journey(self):
        """TC-30: Complete End-to-End User Journey executing 14 sequential real-world actions."""
        client = APIClient()

        # Step 1: Register a new account
        reg_payload = {
            'username': 'e2e_warrior',
            'email': 'warrior@evolvia.net',
            'password': 'CyberPassword2026!',
            'display_name': 'E2E Warrior'
        }
        res_reg = client.post('/api/v1/auth/register/', reg_payload, format='json')
        self.assertEqual(res_reg.status_code, 201, "Step 1 Failed: Registration")
        self.assertIn('access', res_reg.data)

        # Step 2: Log in
        login_payload = {
            'identifier': 'e2e_warrior',
            'password': 'CyberPassword2026!'
        }
        res_login = client.post('/api/v1/auth/login/', login_payload, format='json')
        self.assertEqual(res_login.status_code, 200, "Step 2 Failed: Login")
        access_token = res_login.data['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Step 3: Open the dashboard
        res_dash = client.get('/api/v1/dashboard/')
        self.assertEqual(res_dash.status_code, 200, "Step 3 Failed: Dashboard load")
        self.assertEqual(res_dash.data['greeting_name'], 'E2E')
        initial_xp = res_dash.data['profile']['total_xp']

        # Step 4: Create a quest
        quest_payload = {
            'title': 'Master Cyber Threat Intelligence',
            'difficulty': 'HARD',
            'estimated_minutes': 60
        }
        res_quest = client.post('/api/v1/quests/', quest_payload, format='json')
        self.assertEqual(res_quest.status_code, 201, "Step 4 Failed: Create quest")
        quest_id = res_quest.data['id']
        self.assertEqual(res_quest.data['xp_reward'], 100)

        # Step 5: Complete the quest
        res_complete = client.post(f'/api/v1/quests/{quest_id}/complete/')
        self.assertEqual(res_complete.status_code, 200, "Step 5 Failed: Complete quest")
        self.assertFalse(res_complete.data['already_completed'])

        # Step 6: Verify XP reward
        xp_awarded = res_complete.data['xp_awarded']
        self.assertGreaterEqual(xp_awarded, 100, "Step 6 Failed: XP reward verification")

        # Step 7: Verify player progression
        user = User.objects.get(username='e2e_warrior')
        user.profile.refresh_from_db()
        self.assertEqual(user.profile.total_xp, initial_xp + xp_awarded, "Step 7 Failed: Progression update")

        # Step 8: Check an existing habit
        habit = Habit.objects.create(user=user, name='Daily Deep Reading')
        res_habit = client.post(f'/api/v1/habits/{habit.id}/check-in/')
        self.assertEqual(res_habit.status_code, 200, "Step 8 Failed: Habit check-in")
        self.assertEqual(res_habit.data['xp_awarded'], 10)

        # Step 9: Start a focus session
        res_focus_start = client.post('/api/v1/focus/sessions/', {'mode': 'POMODORO', 'planned_seconds': 1500}, format='json')
        self.assertEqual(res_focus_start.status_code, 201, "Step 9 Failed: Start focus session")
        session_id = res_focus_start.data['id']

        # Step 10: Verify session persistence
        res_focus_active = client.get('/api/v1/focus/sessions/active/')
        self.assertEqual(res_focus_active.status_code, 200, "Step 10 Failed: Session persistence")
        self.assertEqual(res_focus_active.data['id'], session_id)

        # Step 11: Open achievements
        res_ach = client.get('/api/v1/achievements/')
        self.assertEqual(res_ach.status_code, 200, "Step 11 Failed: Achievements catalog")

        # Step 12: Open analytics
        res_analytics = client.get('/api/v1/analytics/xp/')
        self.assertEqual(res_analytics.status_code, 200, "Step 12 Failed: Analytics data")

        # Step 13: Interact with Evo AI
        res_ai = client.post('/api/v1/ai/chat/', {'message': 'Plan my afternoon sprints'}, format='json')
        self.assertEqual(res_ai.status_code, 200, "Step 13 Failed: Evo AI interaction")
        self.assertIn('reply', res_ai.data)

        # Step 14: Log out
        client.credentials()  # Clear auth token
        res_logout_check = client.get('/api/v1/profile/')
        self.assertEqual(res_logout_check.status_code, 401, "Step 14 Failed: Logout / De-authorization")
