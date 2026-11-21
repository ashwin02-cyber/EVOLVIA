from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer

class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        achievements = Achievement.objects.filter(
            user_achievements__user=request.user
        ).order_by('-user_achievements__unlocked_at')[:3]
        if not achievements.exists():
            achievements = Achievement.objects.filter(is_active=True)[:3]
        serializer = self.get_serializer(achievements, many=True)
        return Response(serializer.data)
