import logging
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .throttling import AIUserRateThrottle
from .services.gemini_client import is_gemini_available
from .services.chat_service import chat_with_evo
from .services.planning_service import plan_day_for_user
from apps.quests.services import create_quest

logger = logging.getLogger(__name__)


class AIStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        gemini_up = is_gemini_available()
        return Response({
            'online': True,
            'mode': 'gemini' if gemini_up else 'fallback',
            'gemini_configured': gemini_up,
        })


class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AIUserRateThrottle]

    def post(self, request):
        message = request.data.get('message', '')
        if not isinstance(message, str) or not message.strip():
            return Response(
                {'error': 'Message is required and must be a non-empty string.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(message) > 1000:
            return Response(
                {'error': 'Message exceeds 1000 character limit.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = chat_with_evo(user=request.user, message=message)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"[EvoAI] Chat error for user {request.user.id}: {e}")
            return Response({
                'reply': "I'm having a moment. Please try again shortly.",
                'mode': 'fallback',
                'suggestions': [],
            }, status=status.HTTP_200_OK)


class PlanDayView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AIUserRateThrottle]

    def post(self, request):
        available_minutes = request.data.get('available_minutes', 180)
        focus_areas = request.data.get('focus_areas', [])
        
        try:
            available_minutes = int(available_minutes)
        except (TypeError, ValueError):
            available_minutes = 180
        
        if not isinstance(focus_areas, list):
            focus_areas = []
        
        try:
            result = plan_day_for_user(
                user=request.user,
                available_minutes=available_minutes,
                focus_areas=focus_areas[:5]
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"[EvoAI] Plan day error for user {request.user.id}: {e}")
            return Response(
                {'error': 'Failed to generate plan.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PlanDayAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])
        
        if not isinstance(items, list) or not items:
            return Response(
                {'error': 'items list is required and must be non-empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(items) > 20:
            return Response(
                {'error': 'Cannot create more than 20 quests at once.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_quests = []
        errors = []
        
        with transaction.atomic():
            for item in items:
                if not isinstance(item, dict):
                    continue
                if item.get('is_break'):
                    continue  # Skip break blocks
                
                title = str(item.get('title', '')).strip()
                if not title or len(title) > 200:
                    errors.append(f"Invalid title: {title[:50]}")
                    continue
                
                difficulty = str(item.get('difficulty', 'MEDIUM')).upper()
                if difficulty not in {'EASY', 'MEDIUM', 'HARD', 'EPIC'}:
                    difficulty = 'MEDIUM'
                
                try:
                    estimated = max(5, min(int(item.get('estimated_minutes', 30)), 480))
                except (TypeError, ValueError):
                    estimated = 30
                
                try:
                    q = create_quest(
                        user=request.user,
                        title=title,
                        difficulty=difficulty,
                        estimated_minutes=estimated,
                    )
                    created_quests.append({
                        'id': q.id,
                        'title': q.title,
                        'difficulty': q.difficulty,
                        'xp_reward': q.xp_reward,
                        'estimated_minutes': q.estimated_minutes,
                        'status': q.status,
                    })
                except Exception as e:
                    logger.error(f"[EvoAI] Failed to create quest '{title}': {e}")
                    errors.append(f"Failed to create: {title[:50]}")
        
        return Response({
            'created': created_quests,
            'created_count': len(created_quests),
            'errors': errors,
        }, status=status.HTTP_201_CREATED)
