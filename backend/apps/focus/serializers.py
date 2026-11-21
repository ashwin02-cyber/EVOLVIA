from rest_framework import serializers
from .models import FocusSession

class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = [
            'id', 'mode', 'planned_seconds', 'started_at', 'ended_at',
            'status', 'paused_total_seconds', 'pause_count', 'quest', 'xp_awarded'
        ]
        read_only_fields = ['started_at', 'ended_at', 'status', 'paused_total_seconds', 'pause_count', 'xp_awarded']
