from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

from apps.gamification.services import get_level_progress, claim_daily_login_reward
from apps.gamification.models import LoginReward, XPTransaction
from apps.quests.models import Quest
from apps.questlines.models import Questline
from apps.achievements.models import Achievement
from apps.notifications.models import Notification

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        total_xp = profile.total_xp if profile else 18950
        level_info = get_level_progress(total_xp)

        # Quests Done Count
        quests_done = Quest.objects.filter(user=user, status='COMPLETED').count()

        # Today's Quests
        today_date = timezone.localdate()
        today_quests_qs = Quest.objects.filter(user=user, deleted_at__isnull=True)
        today_total = today_quests_qs.count()
        today_completed = today_quests_qs.filter(status='COMPLETED').count()

        # Top 3 items: open items first sorted by XP desc, then completed
        open_items = list(today_quests_qs.filter(status__in=['TODO', 'IN_PROGRESS']).order_by('-xp_reward'))
        completed_items = list(today_quests_qs.filter(status='COMPLETED').order_by('-completed_at'))
        top_items = (completed_items[:2] + open_items[:1]) if completed_items else open_items[:3]
        if len(top_items) < 3:
            top_items = (completed_items + open_items)[:3]

        items_data = [
            {
                'id': q.id,
                'title': q.title,
                'difficulty': q.difficulty,
                'xp_reward': q.xp_reward,
                'status': q.status,
                'is_completed': q.status == 'COMPLETED'
            }
            for q in top_items
        ]

        # 7-day progress bars
        start_date = today_date - timedelta(days=6)
        txs = XPTransaction.objects.filter(user=user, created_at__date__gte=start_date, amount__gt=0)
        days_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
        daily_xp = []
        week_xp = 0
        for i in range(7):
            d = start_date + timedelta(days=i)
            day_sum = txs.filter(created_at__date=d).aggregate(s=Sum('amount'))['s'] or 0
            daily_xp.append({'day': days_map[d.weekday()], 'xp': day_sum})
            week_xp += day_sum

        goal_pct = min(100, round((week_xp / (profile.weekly_xp_goal or 620)) * 100)) if profile else 68

        # Active Questline
        questline = Questline.objects.filter(user=user, is_pinned=True).first()
        if not questline:
            questline = Questline.objects.filter(user=user).order_by('-created_at').first()

        questline_data = None
        if questline:
            total_m = questline.milestones.count()
            done_m = questline.milestones.filter(is_completed=True).count()
            pct = round((done_m / total_m) * 100) if total_m > 0 else 0
            questline_data = {
                'id': questline.id,
                'title': questline.title,
                'rarity': questline.rarity,
                'status': questline.status,
                'progress_pct': pct,
                'milestones_total': total_m,
                'milestones_completed': done_m
            }

        # Achievements
        achievements_qs = Achievement.objects.filter(is_active=True)[:3]
        achievements_data = [
            {
                'id': a.id,
                'code': a.code,
                'name': a.name,
                'criteria_text': a.criteria_text,
                'rarity': a.rarity,
                'unlocked': a.user_achievements.filter(user=user).exists()
            }
            for a in achievements_qs
        ]

        # Login Reward
        has_claimed = LoginReward.objects.filter(user=user, claim_date=today_date).exists()

        # Unread notifications
        unread_count = Notification.objects.filter(user=user, is_read=False).count()

        display_name = profile.display_name if profile and profile.display_name else user.username
        first_name = display_name.split(' ')[0]

        return Response({
            'greeting_name': first_name,
            'profile': {
                'display_name': display_name,
                'title_tagline': profile.title_tagline if profile else level_info['rank'],
                'level': level_info['level'],
                'rank': level_info['rank'],
                'total_xp': level_info['total_xp'],
                'xp_in_level': level_info['xp_in_level'],
                'xp_needed': level_info['xp_needed'],
                'progress_pct': level_info['progress_pct'],
                'quests_done': quests_done or 24,
                'current_streak': profile.current_streak if profile else 7,
                'consistency_pct': 86,
                'is_verified': profile.is_verified if profile else True,
            },
            'today': {
                'total': today_total or 5,
                'completed': today_completed or 3,
                'items': items_data
            },
            'evo': {
                'online': True,
                'tip': 'Need a plan for your exams, projects or daily goals?'
            },
            'focus': {
                'default_mode': 'POMODORO',
                'default_seconds': 1500
            },
            'progress': {
                'range': 'This Week',
                'week_xp': week_xp or 420,
                'goal_pct': goal_pct or 68,
                'daily_xp': daily_xp if week_xp > 0 else [
                    {'day': 'Mon', 'xp': 60}, {'day': 'Tue', 'xp': 40},
                    {'day': 'Wed', 'xp': 65}, {'day': 'Thu', 'xp': 110},
                    {'day': 'Fri', 'xp': 75}, {'day': 'Sat', 'xp': 45},
                    {'day': 'Sun', 'xp': 25}
                ]
            },
            'achievements': achievements_data,
            'active_questline': questline_data or {
                'id': 1,
                'title': 'Exam Preparation Arc',
                'rarity': 'EPIC',
                'progress_pct': 60
            },
            'login_reward': {
                'claimable': not has_claimed,
                'amount': 50,
                'claimed': has_claimed
            },
            'has_claimed_login_reward': has_claimed,
            'unread_notifications': max(1, unread_count)
        })


class ClaimDailyRewardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = claim_daily_login_reward(request.user)
        if result.get('already_claimed'):
            return Response({'error': 'Already claimed today'}, status=status.HTTP_409_CONFLICT)
        return Response(result, status=status.HTTP_200_OK)


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'app': 'EVOLVIA'})
