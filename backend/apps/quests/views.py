from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quest, QuestCategory
from .serializers import QuestSerializer, QuestCategorySerializer
from .services import create_quest, complete_quest, undo_complete_quest, calculate_xp_reward

class QuestViewSet(viewsets.ModelViewSet):
    serializer_class = QuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Quest.objects.filter(user=self.request.user, deleted_at__isnull=True)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category_id=category_param)
        difficulty_param = self.request.query_params.get('difficulty')
        if difficulty_param:
            qs = qs.filter(difficulty=difficulty_param)
        search = self.request.query_params.get('q')
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    def perform_create(self, serializer):
        difficulty = serializer.validated_data.get('difficulty', 'MEDIUM')
        estimated = serializer.validated_data.get('estimated_minutes', 30)
        xp = calculate_xp_reward(difficulty, estimated)
        serializer.save(user=self.request.user, xp_reward=xp)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        try:
            result = complete_quest(quest_id=pk, user=request.user)
            return Response(result, status=status.HTTP_200_OK)
        except Quest.DoesNotExist:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='undo-complete')
    def undo_complete(self, request, pk=None):
        try:
            result = undo_complete_quest(quest_id=pk, user=request.user)
            if not result.get('reverted'):
                return Response(result, status=status.HTTP_409_CONFLICT)
            return Response(result, status=status.HTTP_200_OK)
        except Quest.DoesNotExist:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='preview-xp')
    def preview_xp(self, request):
        diff = request.query_params.get('difficulty', 'MEDIUM')
        est = int(request.query_params.get('estimated_minutes', 30))
        xp = calculate_xp_reward(diff, est)
        return Response({'xp_reward': xp})


class QuestCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = QuestCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuestCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
