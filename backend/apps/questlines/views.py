from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Questline, QuestlineMilestone
from .serializers import QuestlineSerializer, QuestlineMilestoneSerializer
from apps.gamification.services import award_xp

class QuestlineViewSet(viewsets.ModelViewSet):
    serializer_class = QuestlineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Questline.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        questline = Questline.objects.filter(user=request.user, is_pinned=True, status='ACTIVE').first()
        if not questline:
            questline = Questline.objects.filter(user=request.user, status='ACTIVE').first()
        if not questline:
            questline = Questline.objects.filter(user=request.user).first()
        if not questline:
            return Response({'error': 'No questlines found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(QuestlineSerializer(questline).data)

    @action(detail=True, methods=['post'], url_path='milestones/(?P<milestone_id>[^/.]+)/complete')
    @transaction.atomic
    def complete_milestone(self, request, pk=None, milestone_id=None):
        try:
            questline = Questline.objects.select_for_update().get(id=pk, user=request.user)
            milestone = questline.milestones.select_for_update().get(id=milestone_id)
        except (Questline.DoesNotExist, QuestlineMilestone.DoesNotExist):
            return Response({'error': 'Questline or milestone not found'}, status=status.HTTP_404_NOT_FOUND)

        if milestone.is_completed:
            return Response({
                'already_completed': True,
                'xp_awarded': 0,
                'questline': QuestlineSerializer(questline).data,
                'profile': {
                    'total_xp': request.user.profile.total_xp,
                    'level': request.user.profile.level,
                }
            }, status=status.HTTP_200_OK)

        milestone.is_completed = True
        milestone.completed_at = timezone.now()
        milestone.save(update_fields=['is_completed', 'completed_at'])

        # Award milestone XP
        result = award_xp(
            user=request.user,
            base_amount=milestone.xp_reward,
            source_type='MILESTONE',
            source_id=f"MILESTONE_{milestone.id}"
        )

        # Check if all milestones done
        questline_completed = False
        bonus_awarded = 0
        if not questline.milestones.filter(is_completed=False).exists():
            if questline.status != 'COMPLETED':
                questline.status = 'COMPLETED'
                questline.completed_at = timezone.now()
                questline.save(update_fields=['status', 'completed_at'])
                questline_completed = True
                # Bonus XP awarded only once
                bonus_res = award_xp(
                    user=request.user,
                    base_amount=questline.bonus_xp,
                    source_type='QUESTLINE',
                    source_id=f"QUESTLINE_{questline.id}"
                )
                bonus_awarded = bonus_res['xp_awarded']

        questline.refresh_from_db()
        result['questline'] = QuestlineSerializer(questline).data
        result['questline_completed'] = questline_completed
        result['bonus_xp_awarded'] = bonus_awarded
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        questline = self.get_object()
        Questline.objects.filter(user=request.user).update(is_pinned=False)
        questline.is_pinned = True
        questline.save(update_fields=['is_pinned'])
        return Response(QuestlineSerializer(questline).data)
