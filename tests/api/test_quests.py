from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.quests.models import Quest, QuestCompletion

class QuestManagementTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='quest_master', email='qm@evolvia.net', password='Password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Quest Master', total_xp=1000, level=4)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_tc05_create_quest(self):
        """TC-05: Create Quest - Verify creation and backend calculated XP reward."""
        payload = {
            'title': 'Master Neural Networks',
            'description': 'Implement backpropagation algorithm from scratch.',
            'difficulty': 'HARD',
            'estimated_minutes': 60,
        }
        res = self.client.post('/api/v1/quests/', payload, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['title'], 'Master Neural Networks')
        self.assertEqual(res.data['xp_reward'], 100) # HARD difficulty = 100 XP
        self.assertEqual(res.data['status'], 'TODO')

        # Verify DB
        quest = Quest.objects.filter(id=res.data['id'], user=self.user).first()
        self.assertIsNotNone(quest)
        self.assertEqual(quest.difficulty, 'HARD')

    def test_tc06_edit_quest(self):
        """TC-06: Edit Quest - Modify title and description, verify persistence."""
        quest = Quest.objects.create(user=self.user, title='Draft Thesis Outline', difficulty='MEDIUM', xp_reward=50)

        patch_res = self.client.patch(f'/api/v1/quests/{quest.id}/', {
            'title': 'Draft Thesis Abstract & Outline',
            'description': 'Include literature review citations.'
        }, format='json')

        self.assertEqual(patch_res.status_code, 200)
        quest.refresh_from_db()
        self.assertEqual(quest.title, 'Draft Thesis Abstract & Outline')
        self.assertEqual(quest.description, 'Include literature review citations.')

    def test_tc07_delete_quest(self):
        """TC-07: Delete Quest - Delete quest and verify it no longer appears in active list."""
        quest = Quest.objects.create(user=self.user, title='Discardable Task', difficulty='EASY', xp_reward=25)

        del_res = self.client.delete(f'/api/v1/quests/{quest.id}/')
        self.assertEqual(del_res.status_code, 204)

        # Verify not in active list
        list_res = self.client.get('/api/v1/quests/')
        quest_ids = [q['id'] for q in list_res.data]
        self.assertNotIn(quest.id, quest_ids)

    def test_tc08_quest_completion(self):
        """TC-08: Quest Completion - Complete quest, verify status & XP reward."""
        quest = Quest.objects.create(user=self.user, title='Complete Java Assignment', difficulty='HARD', xp_reward=100)
        initial_xp = self.profile.total_xp

        comp_res = self.client.post(f'/api/v1/quests/{quest.id}/complete/')
        self.assertEqual(comp_res.status_code, 200)
        self.assertFalse(comp_res.data['already_completed'])
        self.assertGreaterEqual(comp_res.data['xp_awarded'], 100)

        # Verify quest is marked completed
        quest.refresh_from_db()
        self.assertEqual(quest.status, 'COMPLETED')
        self.assertIsNotNone(quest.completed_at)

        # Verify user profile gained XP
        self.profile.refresh_from_db()
        self.assertGreater(self.profile.total_xp, initial_xp)

    def test_tc09_duplicate_quest_completion_idempotency(self):
        """TC-09: Duplicate Quest Completion - Repeating completion returns 0 XP."""
        quest = Quest.objects.create(user=self.user, title='Single Reward Quest', difficulty='MEDIUM', xp_reward=50)

        # First completion
        res1 = self.client.post(f'/api/v1/quests/{quest.id}/complete/')
        self.assertEqual(res1.status_code, 200)
        self.assertFalse(res1.data['already_completed'])
        awarded_first = res1.data['xp_awarded']
        self.profile.refresh_from_db()
        first_total = self.profile.total_xp

        # Second completion attempt
        res2 = self.client.post(f'/api/v1/quests/{quest.id}/complete/')
        self.assertEqual(res2.status_code, 200)
        self.assertTrue(res2.data['already_completed'])
        self.assertEqual(res2.data['xp_awarded'], 0)

        # Ensure no duplicate XP was credited
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.total_xp, first_total)
