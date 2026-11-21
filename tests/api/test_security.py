from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.quests.models import Quest

class SecurityAndValidationTests(TestCase):
    def setUp(self):
        # User A
        self.user_a = User.objects.create_user(username='alice', email='alice@evolvia.net', password='Password123')
        self.profile_a = UserProfile.objects.create(user=self.user_a, display_name='Alice')
        self.client_a = APIClient()
        self.client_a.force_authenticate(user=self.user_a)

        # User B
        self.user_b = User.objects.create_user(username='bob', email='bob@evolvia.net', password='Password123')
        self.profile_b = UserProfile.objects.create(user=self.user_b, display_name='Bob')
        self.client_b = APIClient()
        self.client_b.force_authenticate(user=self.user_b)

    def test_tc23_authorization_and_ownership(self):
        """TC-23: Authorization and Ownership - User B cannot view, edit or complete User A's quest."""
        quest_a = Quest.objects.create(user=self.user_a, title="Alice's Private Quest", difficulty='HARD', xp_reward=100)

        # User B attempts to access Alice's quest -> should return 404 Not Found
        res_get = self.client_b.get(f'/api/v1/quests/{quest_a.id}/')
        self.assertEqual(res_get.status_code, 404)

        # User B attempts to edit Alice's quest -> should return 404 Not Found
        res_patch = self.client_b.patch(f'/api/v1/quests/{quest_a.id}/', {'title': 'Hacked Title'}, format='json')
        self.assertEqual(res_patch.status_code, 404)

        # User B attempts to complete Alice's quest -> should return 404 Not Found
        res_comp = self.client_b.post(f'/api/v1/quests/{quest_a.id}/complete/')
        self.assertEqual(res_comp.status_code, 404)

    def test_tc24_input_validation(self):
        """TC-24: Input Validation - Submit empty fields, invalid values, oversized input."""
        # Empty title
        res_empty = self.client_a.post('/api/v1/quests/', {'title': '', 'difficulty': 'MEDIUM'}, format='json')
        self.assertEqual(res_empty.status_code, 400)

        # Invalid difficulty
        res_bad_diff = self.client_a.post('/api/v1/quests/', {'title': 'Valid Title', 'difficulty': 'ULTRA_EXTREME'}, format='json')
        self.assertEqual(res_bad_diff.status_code, 400)

        # Oversized title (>120 chars)
        oversized = 'X' * 200
        res_oversized = self.client_a.post('/api/v1/quests/', {'title': oversized, 'difficulty': 'MEDIUM'}, format='json')
        self.assertEqual(res_oversized.status_code, 400)

    def test_tc25_api_error_handling(self):
        """TC-25: API Error Handling - Verify standard error responses and no exposed stack traces."""
        # Querying non-existent endpoint or invalid resource
        res_404 = self.client_a.get('/api/v1/quests/999999/')
        self.assertEqual(res_404.status_code, 404)

        # Malformed JSON payload
        res_malformed = self.client_a.post(
            '/api/v1/quests/',
            data='{"title": "broken json',
            content_type='application/json'
        )
        self.assertIn(res_malformed.status_code, [400, 422])
        # Ensure no python traceback in response text
        self.assertNotIn('Traceback (most recent call last)', res_malformed.content.decode('utf-8', errors='ignore'))
