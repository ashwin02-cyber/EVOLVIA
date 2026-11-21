from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count
from apps.gamification.models import XPTransaction
from apps.quests.models import Quest
from apps.focus.models import FocusSession

class XPAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        start = today - timedelta(days=6)

        txs = XPTransaction.objects.filter(
            user=request.user,
            created_at__date__gte=start,
            amount__gt=0
        )

        daily = []
        days_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
        total = 0

        for i in range(7):
            d = start + timedelta(days=i)
            day_txs = txs.filter(created_at__date=d)
            xp_sum = day_txs.aggregate(s=Sum('amount'))['s'] or 0
            daily.append({
                'day': days_map[d.weekday()],
                'date': d.isoformat(),
                'xp': xp_sum
            })
            total += xp_sum

        return Response({
            'daily_xp': daily,
            'week_xp': total,
            'range': 'This Week'
        })


class QuestAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        quests = Quest.objects.filter(user=request.user, deleted_at__isnull=True)
        total = quests.count()
        completed = quests.filter(status='COMPLETED').count()

        cat_breakdown = quests.values('category__name').annotate(cnt=Count('id'))

        return Response({
            'total_quests': total,
            'completed_quests': completed,
            'categories': list(cat_breakdown)
        })


class FocusAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = FocusSession.objects.filter(user=request.user, status='COMPLETED')
        total_seconds = sessions.aggregate(s=Sum('planned_seconds'))['s'] or 0
        total_minutes = round(total_seconds / 60)
        session_count = sessions.count()

        return Response({
            'total_minutes': total_minutes,
            'session_count': session_count
        })
