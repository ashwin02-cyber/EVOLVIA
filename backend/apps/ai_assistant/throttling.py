"""Rate limiting: 30 requests per user per hour for AI endpoints."""
from rest_framework.throttling import UserRateThrottle

class AIUserRateThrottle(UserRateThrottle):
    scope = 'ai_user'
    rate = '30/hour'
