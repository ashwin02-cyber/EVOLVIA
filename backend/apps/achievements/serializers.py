from rest_framework import serializers
from .models import Achievement, UserAchievement

class AchievementSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = [
            'id', 'code', 'name', 'description', 'criteria_text',
            'rarity', 'xp_bonus', 'crystal_bonus', 'icon_key',
            'unlocked', 'unlocked_at'
        ]

    def get_unlocked(self, obj):
        user = self.context.get('request').user
        if not user or user.is_anonymous:
            return False
        return obj.user_achievements.filter(user=user).exists()

    def get_unlocked_at(self, obj):
        user = self.context.get('request').user
        if not user or user.is_anonymous:
            return None
        ua = obj.user_achievements.filter(user=user).first()
        return ua.unlocked_at if ua else None
