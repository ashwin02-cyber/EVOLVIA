from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Habit, HabitLog

class HabitSerializer(serializers.ModelSerializer):
    completed_today = serializers.SerializerMethodField()
    week_history = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'icon', 'color_token', 'frequency',
            'target_time', 'current_streak', 'longest_streak',
            'completed_today', 'week_history', 'created_at'
        ]
        read_only_fields = ['current_streak', 'longest_streak', 'created_at']

    def get_completed_today(self, obj):
        today = timezone.localdate()
        return obj.logs.filter(log_date=today).exists()

    def get_week_history(self, obj):
        today = timezone.localdate()
        start = today - timedelta(days=6)
        logs = set(obj.logs.filter(log_date__gte=start).values_list('log_date', flat=True))
        return [(start + timedelta(days=i)) in logs for i in range(7)]
