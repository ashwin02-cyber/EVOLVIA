from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Habit, HabitLog
from .serializers import HabitSerializer
from .services import check_in_habit

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user, archived_at__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in(self, request, pk=None):
        try:
            result = check_in_habit(habit_id=pk, user=request.user)
            return Response(result, status=status.HTTP_200_OK)
        except Habit.DoesNotExist:
            return Response({'error': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)
