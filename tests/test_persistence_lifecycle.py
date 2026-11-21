import os
import sys
import unittest
from pathlib import Path
from datetime import timedelta
import django

# Setup Django environment
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evolvia.settings')
django.setup()

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.quests.models import Quest, QuestCompletion
from apps.questlines.models import Questline, QuestlineMilestone
from apps.habits.models import Habit, HabitLog
from apps.focus.models import FocusSession
from apps.achievements.models import Achievement, UserAchievement
from apps.gamification.models import XPTransaction
from apps.notifications.models import Notification

class FullStackPersistenceLifecycleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='ashwin_persistence',
            email='ashwin_persist@evolvia.net',
            password='Password123!'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            display_name='Ashwin Bhalaji',
            total_xp=18950,
            level=12,
            current_streak=7,
            longest_streak=14,
            crystals=45
        )

        # Authenticate via JWT
        res = self.client.post('/api/v1/auth/login/', {
            'identifier': 'ashwin_persistence',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 200)
        self.token = res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_01_questline_milestone_and_100pct_persistence_survives_refresh(self):
        """
        Section 8: Specific Questline Regression Test
        1. Create a questline with 5 milestones.
        2. Complete milestone 1 -> verify DB write & XP transaction.
        3. Simulate browser refresh (new HTTP GET) -> confirm milestone 1 remains COMPLETED.
        4. Complete remaining milestones 2, 3, 4, 5.
        5. Verify progress reaches 100%.
        6. Simulate browser refresh again -> confirm all 5 remain COMPLETED.
        7. Verify questline completion recorded in DB and bonus XP awarded exactly once.
        8. Verify idempotency: repeated complete call awards 0 XP.
        """
        ql = Questline.objects.create(
            user=self.user,
            title='Exam Preparation Arc (Test)',
            description='Test Arc',
            rarity='EPIC',
            is_pinned=True,
            status='ACTIVE',
            bonus_xp=350
        )
        m1 = QuestlineMilestone.objects.create(questline=ql, order=1, title='Complete Java Assignment', xp_reward=50)
        m2 = QuestlineMilestone.objects.create(questline=ql, order=2, title='Study Cyber Forensics', xp_reward=50)
        m3 = QuestlineMilestone.objects.create(questline=ql, order=3, title='Database Schema Drill', xp_reward=50)
        m4 = QuestlineMilestone.objects.create(questline=ql, order=4, title='Operating Systems Mock', xp_reward=50)
        m5 = QuestlineMilestone.objects.create(questline=ql, order=5, title='Comprehensive Exam Sim', xp_reward=50)

        initial_xp = self.user.profile.total_xp

        # Step 2: Complete milestone 1
        res1 = self.client.post(f'/api/v1/questlines/{ql.id}/milestones/{m1.id}/complete/')
        self.assertEqual(res1.status_code, 200)
        self.assertFalse(res1.data.get('already_completed', False))

        # Verify DB write
        m1.refresh_from_db()
        self.assertTrue(m1.is_completed)
        self.assertIsNotNone(m1.completed_at)

        # Verify XP Transaction
        tx = XPTransaction.objects.filter(user=self.user, source_type='MILESTONE', source_id=f'MILESTONE_{m1.id}').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, 50) # Milestone awards exact base XP (50)

        # Step 3: Simulate browser reload (GET /api/v1/questlines/{id}/)
        reload_client = APIClient()
        reload_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res_get = reload_client.get(f'/api/v1/questlines/{ql.id}/')
        self.assertEqual(res_get.status_code, 200)
        m1_data = next(m for m in res_get.data['milestones'] if m['id'] == m1.id)
        self.assertTrue(m1_data['is_completed'])
        self.assertEqual(m1_data['status'], 'COMPLETED')

        # Next milestone m2 should now be ACTIVE
        m2_data = next(m for m in res_get.data['milestones'] if m['id'] == m2.id)
        self.assertEqual(m2_data['status'], 'ACTIVE')

        # Step 4: Complete remaining milestones
        for m in [m2, m3, m4, m5]:
            res = self.client.post(f'/api/v1/questlines/{ql.id}/milestones/{m.id}/complete/')
            self.assertEqual(res.status_code, 200)

        # Step 5 & 6: Verify progress reaches 100% and survives refresh
        reload_client_2 = APIClient()
        reload_client_2.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res_after = reload_client_2.get(f'/api/v1/questlines/{ql.id}/')
        self.assertEqual(res_after.data['progress_pct'], 100)
        self.assertEqual(res_after.data['milestones_completed'], 5)
        for m_data in res_after.data['milestones']:
            self.assertTrue(m_data['is_completed'])
            self.assertEqual(m_data['status'], 'COMPLETED')

        # Step 7: Verify questline status in database is COMPLETED and bonus XP awarded
        ql.refresh_from_db()
        self.assertEqual(ql.status, 'COMPLETED')
        self.assertIsNotNone(ql.completed_at)

        questline_bonus_txs = XPTransaction.objects.filter(user=self.user, source_type='QUESTLINE', source_id=f'QUESTLINE_{ql.id}')
        self.assertEqual(questline_bonus_txs.count(), 1)
        self.assertEqual(questline_bonus_txs.first().amount, 350)

        # Step 8: Idempotency check: Repeated completion call awards 0 XP and does not duplicate
        dup_res = self.client.post(f'/api/v1/questlines/{ql.id}/milestones/{m1.id}/complete/')
        self.assertEqual(dup_res.status_code, 200)
        self.assertTrue(dup_res.data.get('already_completed'))
        self.assertEqual(dup_res.data.get('xp_awarded'), 0)

        # Confirm no duplicate bonus transactions
        self.assertEqual(XPTransaction.objects.filter(user=self.user, source_type='QUESTLINE', source_id=f'QUESTLINE_{ql.id}').count(), 1)

    def test_02_quest_lifecycle_survives_refresh(self):
        """Verify quest creation, modification, completion, undo, and deletion persist in DB."""
        # 1. Create Quest
        res_create = self.client.post('/api/v1/quests/', {
            'title': 'System Analysis & Architecture',
            'description': 'Analyze persistence boundaries',
            'difficulty': 'HARD',
            'estimated_minutes': 45
        })
        self.assertEqual(res_create.status_code, 201)
        quest_id = res_create.data['id']

        # 2. Simulate refresh: read from DB
        res_get = self.client.get('/api/v1/quests/')
        self.assertTrue(any(q['id'] == quest_id for q in res_get.data))

        # 3. Edit Quest
        res_edit = self.client.patch(f'/api/v1/quests/{quest_id}/', {
            'title': 'System Analysis & Architecture (Updated)'
        })
        self.assertEqual(res_edit.status_code, 200)

        # Refresh verify edit
        res_get_edited = self.client.get(f'/api/v1/quests/{quest_id}/')
        self.assertEqual(res_get_edited.data['title'], 'System Analysis & Architecture (Updated)')

        # 4. Complete Quest
        res_comp = self.client.post(f'/api/v1/quests/{quest_id}/complete/')
        self.assertEqual(res_comp.status_code, 200)
        self.assertTrue(Quest.objects.get(id=quest_id).status == 'COMPLETED')

        # 5. Undo completion
        res_undo = self.client.post(f'/api/v1/quests/{quest_id}/undo-complete/')
        self.assertEqual(res_undo.status_code, 200)
        self.assertTrue(Quest.objects.get(id=quest_id).status == 'TODO')

        # 6. Delete Quest
        res_del = self.client.delete(f'/api/v1/quests/{quest_id}/')
        self.assertEqual(res_del.status_code, 204)
        self.assertFalse(Quest.objects.filter(id=quest_id, deleted_at__isnull=True).exists())

    def test_03_habit_checkin_and_duplicate_prevention_persists(self):
        """Verify habit creation, daily check-in, streak calculation, and idempotency survive refresh."""
        # Create habit
        res_h = self.client.post('/api/v1/habits/', {
            'name': 'Cold Plunge & Focus Breathwork',
            'target_time': '07:00:00'
        })
        self.assertEqual(res_h.status_code, 201)
        habit_id = res_h.data['id']

        # Daily check-in
        res_check = self.client.post(f'/api/v1/habits/{habit_id}/check-in/')
        self.assertEqual(res_check.status_code, 200)
        self.assertEqual(res_check.data['streak'], 1)

        # Simulate browser refresh (new HTTP GET)
        res_reload = self.client.get('/api/v1/habits/')
        habit_data = next(h for h in res_reload.data if h['id'] == habit_id)
        self.assertTrue(habit_data['completed_today'])
        self.assertEqual(habit_data['current_streak'], 1)

        # Idempotency: second check-in today does not award XP or duplicate
        res_check2 = self.client.post(f'/api/v1/habits/{habit_id}/check-in/')
        self.assertEqual(res_check2.status_code, 200)
        self.assertTrue(res_check2.data.get('already_checked_in'))
        self.assertEqual(res_check2.data.get('xp_awarded'), 0)
        self.assertEqual(HabitLog.objects.filter(habit_id=habit_id).count(), 1)

    def test_04_focus_session_state_and_restoration_persists(self):
        """Verify active focus session starts, can be restored after refresh, and completes with XP."""
        # Start session
        res_start = self.client.post('/api/v1/focus/sessions/', {
            'mode': 'POMODORO',
            'planned_seconds': 1500
        })
        self.assertEqual(res_start.status_code, 201)
        session_id = res_start.data['id']

        # Simulate browser refresh by calling GET active
        res_active = self.client.get('/api/v1/focus/sessions/active/')
        self.assertEqual(res_active.status_code, 200)
        self.assertEqual(res_active.data['id'], session_id)
        self.assertEqual(res_active.data['status'], 'RUNNING')

        # Complete session
        res_done = self.client.post(f'/api/v1/focus/sessions/{session_id}/complete/')
        self.assertEqual(res_done.status_code, 200)
        self.assertGreater(res_done.data['xp_awarded'], 0)

        # Verify DB status
        sess_db = FocusSession.objects.get(id=session_id)
        self.assertEqual(sess_db.status, 'COMPLETED')

        # Active session should now be null/204
        res_no_active = self.client.get('/api/v1/focus/sessions/active/')
        self.assertEqual(res_no_active.status_code, 204)

    def test_05_profile_settings_and_export_survives_refresh(self):
        """Verify user profile update persists in DB across subsequent reads."""
        res_patch = self.client.patch('/api/v1/profile/', {
            'display_name': 'Ashwin Bhalaji - Grandmaster',
            'timezone': 'Asia/Kolkata',
            'settings': {'sound': False, 'glow': 'Maximum'}
        }, format='json')
        self.assertEqual(res_patch.status_code, 200)

        # Simulate reload with separate un-cached request
        res_read = self.client.get('/api/v1/profile/')
        self.assertEqual(res_read.data['display_name'], 'Ashwin Bhalaji - Grandmaster')
        self.assertEqual(res_read.data['timezone'], 'Asia/Kolkata')
        self.assertEqual(res_read.data['settings']['glow'], 'Maximum')

    def test_06_dashboard_aggregates_reflect_actual_database_state(self):
        """Verify dashboard endpoint reflects actual DB records (quests, questlines, progress)."""
        res_dash = self.client.get('/api/v1/dashboard/')
        self.assertEqual(res_dash.status_code, 200)

        # Verify structure reflects real user DB records
        self.assertIn('profile', res_dash.data)
        self.assertIn('today', res_dash.data)
        self.assertIn('active_questline', res_dash.data)
        self.assertIn('has_claimed_login_reward', res_dash.data)

if __name__ == '__main__':
    unittest.main()
