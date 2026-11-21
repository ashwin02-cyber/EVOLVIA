import os
import sys
import django
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reg_data = {
            'username': 'cyber_ninja',
            'email': 'ninja@evolvia.net',
            'password': 'StrongPassword2026!',
            'display_name': 'Cyber Ninja'
        }

    def test_tc01_user_registration(self):
        """TC-01: User Registration - Verify account creation and initial profile."""
        response = self.client.post('/api/v1/auth/register/', self.reg_data, format='json')
        self.assertEqual(response.status_code, 201, f"Expected 201, got {response.status_code}: {response.data}")
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

        # Verify DB persistence
        user = User.objects.filter(username='cyber_ninja').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'ninja@evolvia.net')
        self.assertEqual(user.profile.display_name, 'Cyber Ninja')
        self.assertEqual(user.profile.level, 1)
        self.assertEqual(user.profile.total_xp, 0)

    def test_tc02_user_login_valid(self):
        """TC-02: User Login - Enter valid credentials, verify tokens & profile."""
        # Create user
        user = User.objects.create_user(username='player_one', email='player1@evolvia.net', password='SecretPassword123')
        UserProfile.objects.create(user=user, display_name='Player One', total_xp=500, level=2)

        response = self.client.post('/api/v1/auth/login/', {
            'identifier': 'player_one',
            'password': 'SecretPassword123'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['display_name'], 'Player One')
        self.assertEqual(response.data['user']['level'], 2)

    def test_tc03_invalid_login(self):
        """TC-03: Invalid Login - Incorrect password must be rejected with 401."""
        User.objects.create_user(username='player_sec', email='sec@evolvia.net', password='CorrectPassword')

        # Wrong password
        res_wrong_pw = self.client.post('/api/v1/auth/login/', {
            'identifier': 'player_sec',
            'password': 'WrongPassword123'
        }, format='json')
        self.assertEqual(res_wrong_pw.status_code, 401)
        self.assertIn('error', res_wrong_pw.data)

        # Non-existent user
        res_no_user = self.client.post('/api/v1/auth/login/', {
            'identifier': 'ghost_user',
            'password': 'AnyPassword'
        }, format='json')
        self.assertEqual(res_no_user.status_code, 401)

    def test_tc04_logout_and_session_protection(self):
        """TC-04: Logout and Session Protection - Protected routes reject unauthenticated requests."""
        # Unauthenticated request to protected endpoint
        anon_client = APIClient()
        res_anon = anon_client.get('/api/v1/profile/')
        self.assertEqual(res_anon.status_code, 401)

        # Authenticated client access works
        user = User.objects.create_user(username='auth_user', email='auth@evolvia.net', password='Password123')
        UserProfile.objects.create(user=user, display_name='Auth User')
        auth_client = APIClient()
        auth_client.force_authenticate(user=user)
        res_auth = auth_client.get('/api/v1/profile/')
        self.assertEqual(res_auth.status_code, 200)

        # Logout / token de-authorization
        auth_client.logout()
        res_after = auth_client.get('/api/v1/profile/')
        self.assertEqual(res_after.status_code, 401)

    def test_tc22_authentication_api_token_handling(self):
        """TC-22: Authentication API - Verify token refresh and rotation handling."""
        user = User.objects.create_user(username='token_tester', email='token@evolvia.net', password='Password123')
        UserProfile.objects.create(user=user, display_name='Token Tester')

        # Obtain tokens
        login_res = self.client.post('/api/v1/auth/login/', {
            'identifier': 'token_tester',
            'password': 'Password123'
        }, format='json')
        self.assertEqual(login_res.status_code, 200)
        refresh_token = login_res.data['refresh']

        # Refresh access token
        refresh_res = self.client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token
        }, format='json')
        self.assertEqual(refresh_res.status_code, 200)
        self.assertIn('access', refresh_res.data)
