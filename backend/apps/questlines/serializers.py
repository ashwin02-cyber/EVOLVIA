from rest_framework import serializers
from .models import Questline, QuestlineMilestone

class QuestlineMilestoneSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = QuestlineMilestone
        fields = ['id', 'title', 'order', 'is_completed', 'completed_at', 'xp_reward', 'status']

    def get_status(self, obj):
        if obj.is_completed:
            return 'COMPLETED'
        # If any preceding milestone is not completed, this milestone is LOCKED
        has_uncompleted_preceding = QuestlineMilestone.objects.filter(
            questline=obj.questline,
            order__lt=obj.order,
            is_completed=False
        ).exists()
        return 'LOCKED' if has_uncompleted_preceding else 'ACTIVE'


class QuestlineSerializer(serializers.ModelSerializer):
    milestones = QuestlineMilestoneSerializer(many=True, read_only=True)
    progress_pct = serializers.SerializerMethodField()
    milestones_total = serializers.SerializerMethodField()
    milestones_completed = serializers.SerializerMethodField()

    class Meta:
        model = Questline
        fields = [
            'id', 'title', 'description', 'rarity', 'banner_key',
            'is_pinned', 'status', 'bonus_xp', 'milestones',
            'progress_pct', 'milestones_total', 'milestones_completed', 'created_at'
        ]

    def get_progress_pct(self, obj):
        total = obj.milestones.count()
        if total == 0:
            return 0
        done = obj.milestones.filter(is_completed=True).count()
        return round((done / total) * 100)

    def get_milestones_total(self, obj):
        return obj.milestones.count()

    def get_milestones_completed(self, obj):
        return obj.milestones.filter(is_completed=True).count()
