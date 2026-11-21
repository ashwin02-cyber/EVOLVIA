from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FocusSession
from .serializers import FocusSessionSerializer
from .services import start_session, pause_session, resume_session, abandon_session, complete_session

class FocusSessionViewSet(viewsets.ModelViewSet):
    serializer_class = FocusSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        mode = request.data.get('mode', 'POMODORO')
        planned = int(request.data.get('planned_seconds', 1500))
        quest_id = request.data.get('quest')
        session = start_session(user=request.user, mode=mode, planned_seconds=planned, quest_id=quest_id)
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def active(self, request):
        session = FocusSession.objects.filter(user=request.user, status__in=['RUNNING', 'PAUSED']).first()
        if not session:
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        session = pause_session(session_id=pk, user=request.user)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        session = resume_session(session_id=pk, user=request.user)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def abandon(self, request, pk=None):
        session = abandon_session(session_id=pk, user=request.user)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        result = complete_session(session_id=pk, user=request.user)
        return Response(result, status=status.HTTP_200_OK)
