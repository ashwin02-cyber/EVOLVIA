from rest_framework import serializers
from .models import User, UserProfile
from apps.gamification.services import get_level_progress

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    xp_in_level = serializers.SerializerMethodField()
    xp_needed = serializers.SerializerMethodField()
    progress_pct = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'display_name', 'title_tagline',
            'avatar_key', 'is_verified', 'timezone', 'total_xp',
            'level', 'xp_in_level', 'xp_needed', 'progress_pct',
            'rank', 'current_streak', 'longest_streak', 'crystals',
            'weekly_xp_goal', 'settings', 'onboarded'
        ]
        read_only_fields = ['total_xp', 'level', 'current_streak', 'longest_streak', 'crystals']

    def get_xp_in_level(self, obj):
        return get_level_progress(obj.total_xp)['xp_in_level']

    def get_xp_needed(self, obj):
        return get_level_progress(obj.total_xp)['xp_needed']

    def get_progress_pct(self, obj):
        return get_level_progress(obj.total_xp)['progress_pct']

    def get_rank(self, obj):
        return get_level_progress(obj.total_xp)['rank']


class RegisterSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(max_length=60, required=False, default='')
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'display_name']

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(
            user=user,
            display_name=display_name or user.username
        )
        return user
