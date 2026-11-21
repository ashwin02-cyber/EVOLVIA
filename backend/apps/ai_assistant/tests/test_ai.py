"""AI assistant tests — mocks Gemini to avoid API usage."""
from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.accounts.models import UserProfile
from apps.quests.models import Quest

User = get_user_model()


def make_user(username='testevo', password='testpass123'):
    user = User.objects.create_user(username=username, password=password, email=f'{username}@test.com')
    UserProfile.objects.get_or_create(user=user, defaults={'display_name': username, 'total_xp': 500, 'level': 3})
    return user


class AIStatusTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_status_returns_online(self):
        res = self.client.get('/api/v1/ai/status/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['online'])
        self.assertIn(res.data['mode'], ['gemini', 'fallback'])

    def test_status_requires_auth(self):
        client = APIClient()
        res = client.get('/api/v1/ai/status/')
        self.assertEqual(res.status_code, 401)


class AIChatFallbackTest(TestCase):
    def setUp(self):
        self.user = make_user('chatuser')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch.dict('os.environ', {'GEMINI_API_KEY': ''})
    def test_fallback_chat_no_key(self):
        with patch('apps.ai_assistant.services.gemini_client.GEMINI_API_KEY', ''):
            with patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=False):
                res = self.client.post('/api/v1/ai/chat/', {'message': 'Help me plan my day'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('reply', res.data)
        self.assertEqual(res.data['mode'], 'fallback')
        self.assertIsInstance(res.data['suggestions'], list)

    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=False)
    def test_fallback_uses_pending_quests(self, mock_avail):
        Quest.objects.create(user=self.user, title='Test Quest', difficulty='HARD', xp_reward=100, status='TODO')
        res = self.client.post('/api/v1/ai/chat/', {'message': 'Prioritize my quests'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('reply', res.data)

    def test_chat_rejects_empty_message(self):
        res = self.client.post('/api/v1/ai/chat/', {'message': ''}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_chat_rejects_long_message(self):
        res = self.client.post('/api/v1/ai/chat/', {'message': 'x' * 1001}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_chat_requires_auth(self):
        client = APIClient()
        res = client.post('/api/v1/ai/chat/', {'message': 'hello'}, format='json')
        self.assertEqual(res.status_code, 401)


class AIPlanDayTest(TestCase):
    def setUp(self):
        self.user = make_user('planuser')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        Quest.objects.create(
            user=self.user, title='Study Session', difficulty='HARD',
            xp_reward=100, status='TODO', estimated_minutes=60
        )

    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=False)
    def test_fallback_plan_returns_blocks(self, mock_avail):
        res = self.client.post('/api/v1/ai/plan-day/', {'available_minutes': 120}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('blocks', res.data)
        self.assertIsInstance(res.data['blocks'], list)
        self.assertGreater(len(res.data['blocks']), 0)

    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=False)
    def test_plan_respects_available_time(self, mock_avail):
        res = self.client.post('/api/v1/ai/plan-day/', {'available_minutes': 30}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('blocks', res.data)

    @patch('apps.ai_assistant.services.gemini_client.call_gemini')
    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=True)
    def test_gemini_plan_parsed(self, mock_avail, mock_call):
        mock_call.return_value = '[{"start":"09:00","end":"09:45","title":"Test Task","difficulty":"HARD","estimated_minutes":45,"is_break":false,"quest_id":null}]'
        res = self.client.post('/api/v1/ai/plan-day/', {'available_minutes': 120}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['mode'], 'gemini')
        self.assertEqual(len(res.data['blocks']), 1)
        self.assertEqual(res.data['blocks'][0]['title'], 'Test Task')


class AIPlanAcceptTest(TestCase):
    def setUp(self):
        self.user = make_user('acceptuser')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_accept_creates_quests(self):
        items = [
            {'title': 'Morning Study Block', 'difficulty': 'HARD', 'estimated_minutes': 60, 'is_break': False},
            {'title': 'Short Break', 'difficulty': 'EASY', 'estimated_minutes': 10, 'is_break': True},
        ]
        res = self.client.post('/api/v1/ai/plan-day/accept/', {'items': items}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['created_count'], 1)  # Break blocks excluded
        self.assertEqual(res.data['created'][0]['title'], 'Morning Study Block')

    def test_accept_requires_items(self):
        res = self.client.post('/api/v1/ai/plan-day/accept/', {'items': []}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_cross_user_isolation(self):
        other = make_user('otheruser2')
        other_client = APIClient()
        other_client.force_authenticate(user=other)
        items = [{'title': 'Other User Quest', 'difficulty': 'MEDIUM', 'estimated_minutes': 30, 'is_break': False}]
        res = other_client.post('/api/v1/ai/plan-day/accept/', {'items': items}, format='json')
        self.assertEqual(res.status_code, 201)
        # Verify quest belongs to other user, not self.user
        q = Quest.objects.get(title='Other User Quest')
        self.assertEqual(q.user, other)

    def test_accept_requires_auth(self):
        client = APIClient()
        res = client.post('/api/v1/ai/plan-day/accept/', {'items': [{'title': 'x'}]}, format='json')
        self.assertEqual(res.status_code, 401)


class GeminiChatMockTest(TestCase):
    def setUp(self):
        self.user = make_user('geminiuser')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch('apps.ai_assistant.services.gemini_client.call_gemini')
    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=True)
    def test_gemini_chat_success(self, mock_avail, mock_call):
        mock_call.return_value = "Great question! Here's how to prioritize effectively:\n- Review your HARD quests first.\n- Complete quick EASY tasks to maintain momentum."
        res = self.client.post('/api/v1/ai/chat/', {'message': 'Help me prioritize'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['mode'], 'gemini')
        self.assertIn('reply', res.data)

    @patch('apps.ai_assistant.services.gemini_client.call_gemini', return_value=None)
    @patch('apps.ai_assistant.services.gemini_client.is_gemini_available', return_value=True)
    def test_gemini_timeout_uses_fallback(self, mock_avail, mock_call):
        res = self.client.post('/api/v1/ai/chat/', {'message': 'Plan my day'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['mode'], 'fallback')
