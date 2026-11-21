from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Reward, UserInventory, CrystalTransaction
from .serializers import RewardSerializer, UserInventorySerializer
from apps.accounts.models import UserProfile

class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reward.objects.filter(is_active=True)

    @action(detail=True, methods=['post'])
    def purchase(self, request, pk=None):
        reward = self.get_object()
        user = request.user

        if UserInventory.objects.filter(user=user, reward=reward).exists():
            return Response({'error': 'Item already owned'}, status=status.HTTP_409_CONFLICT)

        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=user)
            if profile.crystals < reward.cost_crystals:
                return Response({'error': 'Insufficient crystals'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            profile.crystals -= reward.cost_crystals
            profile.save(update_fields=['crystals'])

            inv = UserInventory.objects.create(user=user, reward=reward)
            CrystalTransaction.objects.create(
                user=user,
                amount=-reward.cost_crystals,
                reason=f"PURCHASE_{reward.code}",
                ref=str(inv.id)
            )

        return Response(UserInventorySerializer(inv, context={'request': request}).data, status=status.HTTP_201_CREATED)


class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserInventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserInventory.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def equip(self, request, pk=None):
        inv = self.get_object()
        # Unequip others of same type
        reward_type = inv.reward.type
        UserInventory.objects.filter(user=request.user, reward__type=reward_type).update(is_equipped=False)
        inv.is_equipped = True
        inv.save(update_fields=['is_equipped'])
        return Response(UserInventorySerializer(inv, context={'request': request}).data)


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profiles = UserProfile.objects.filter(
            settings__leaderboard_opt_in__isnull=False
        ).exclude(
            settings__leaderboard_opt_in=False
        ).select_related('user').order_by('-total_xp')[:50]

        if not profiles.exists():
            profiles = UserProfile.objects.select_related('user').order_by('-total_xp')[:50]

        entries = []
        for idx, p in enumerate(profiles, start=1):
            entries.append({
                'rank': idx,
                'name': p.display_name or p.user.username,
                'level': p.level,
                'rank_title': p.title_tagline,
                'xp': p.total_xp,
                'streak': p.current_streak,
                'is_me': p.user_id == request.user.id
            })

        my_profile = getattr(request.user, 'profile', None)
        me_rank = None
        if my_profile:
            higher = UserProfile.objects.filter(total_xp__gt=my_profile.total_xp).count()
            me_rank = higher + 1

        return Response({
            'entries': entries,
            'me': {
                'rank': me_rank,
                'xp': my_profile.total_xp if my_profile else 0,
            }
        })
