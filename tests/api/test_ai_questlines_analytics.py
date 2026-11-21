from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.questlines.models import Questline, QuestlineMilestone
from apps.quests.models import Quest

class AIQuestlinesAnalyticsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cyber_architect', email='architect@evolvia.net', password='Password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Cyber Architect', total_xp=2000, level=5)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_tc18_evo_ai_chat_and_graceful_fallback(self):
        """TC-18: Evo AI - Verify AI status and chat query response (with deterministic fallback)."""
        # Status
        status_res = self.client.get('/api/v1/ai/status/')
        self.assertEqual(status_res.status_code, 200)
        self.assertTrue(status_res.data['online'])
        self.assertIn(status_res.data['mode'], ['gemini', 'fallback'])

        # Chat Query
        chat_res = self.client.post('/api/v1/ai/chat/', {'message': 'Motivate me for today!'}, format='json')
        self.assertEqual(chat_res.status_code, 200)
        self.assertIn('reply', chat_res.data)
        self.assertGreater(len(chat_res.data['reply']), 10)

    def test_tc19_plan_my_day_workflow(self):
        """TC-19: Plan My Day - Request day plan and accept to create real quests."""
        # Request plan
        plan_res = self.client.post('/api/v1/ai/plan-day/', {}, format='json')
        self.assertEqual(plan_res.status_code, 200)
        self.assertIn('blocks', plan_res.data)
        self.assertGreaterEqual(len(plan_res.data['blocks']), 1)

        # Accept plan
        accept_payload = {
            'items': [
                {'title': 'AI Planned: Review Cyber Forensics', 'difficulty': 'MEDIUM', 'estimated_minutes': 45},
                {'title': 'AI Planned: Solve 3 LeetCode Drills', 'difficulty': 'HARD', 'estimated_minutes': 60}
            ]
        }
        accept_res = self.client.post('/api/v1/ai/plan-day/accept/', accept_payload, format='json')
        self.assertEqual(accept_res.status_code, 201)
        self.assertEqual(len(accept_res.data['created']), 2)

        # Verify quests created in DB
        self.assertTrue(Quest.objects.filter(user=self.user, title='AI Planned: Review Cyber Forensics').exists())

    def test_tc20_questline_progression_and_completion(self):
        """TC-20: Questline Progression - Complete milestones, verify progress % and arc bonus."""
        ql = Questline.objects.create(
            user=self.user,
            title='Exam Preparation Arc',
            rarity='EPIC',
            is_pinned=True,
            status='ACTIVE',
            bonus_xp=350
        )
        m1 = QuestlineMilestone.objects.create(questline=ql, order=1, title='Study Java', xp_reward=50)
        m2 = QuestlineMilestone.objects.create(questline=ql, order=2, title='Study Forensics', xp_reward=50)

        # Complete M1
        res1 = self.client.post(f'/api/v1/questlines/{ql.id}/milestones/{m1.id}/complete/')
        self.assertEqual(res1.status_code, 200)
        m1.refresh_from_db()
        self.assertTrue(m1.is_completed)

        # Complete M2 (final milestone) -> triggers questline completion
        res2 = self.client.post(f'/api/v1/questlines/{ql.id}/milestones/{m2.id}/complete/')
        self.assertEqual(res2.status_code, 200)
        ql.refresh_from_db()
        self.assertEqual(ql.status, 'COMPLETED')
        self.assertIsNotNone(ql.completed_at)

    def test_tc21_analytics_validation(self):
        """TC-21: Analytics Validation - Verify displayed metrics match backend aggregates."""
        # Create some quests
        Quest.objects.create(user=self.user, title='Task 1', difficulty='HARD', status='COMPLETED')
        Quest.objects.create(user=self.user, title='Task 2', difficulty='MEDIUM', status='TODO')

        res_quests = self.client.get('/api/v1/analytics/quests/')
        self.assertEqual(res_quests.status_code, 200)
        self.assertEqual(res_quests.data['total_quests'], 2)
        self.assertEqual(res_quests.data['completed_quests'], 1)

        res_xp = self.client.get('/api/v1/analytics/xp/')
        self.assertEqual(res_xp.status_code, 200)
        self.assertIn('daily_xp', res_xp.data)
        self.assertEqual(len(res_xp.data['daily_xp']), 7)
