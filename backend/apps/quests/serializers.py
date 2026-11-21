from rest_framework import serializers
from .models import Quest, QuestCategory, QuestCompletion

class QuestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestCategory
        fields = ['id', 'name', 'color_token', 'icon']


class QuestSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Quest
        fields = [
            'id', 'title', 'description', 'difficulty', 'xp_reward',
            'status', 'due_at', 'estimated_minutes', 'recurrence',
            'category', 'category_name', 'completed_at', 'created_at'
        ]
        read_only_fields = ['xp_reward', 'completed_at', 'created_at']
