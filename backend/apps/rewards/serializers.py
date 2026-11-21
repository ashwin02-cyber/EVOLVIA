from rest_framework import serializers
from .models import Reward, UserInventory

class RewardSerializer(serializers.ModelSerializer):
    owned = serializers.SerializerMethodField()

    class Meta:
        model = Reward
        fields = ['id', 'code', 'name', 'description', 'type', 'cost_crystals', 'icon_key', 'owned']

    def get_owned(self, obj):
        user = self.context.get('request').user
        if not user or user.is_anonymous:
            return False
        return obj.owned_by.filter(user=user).exists()


class UserInventorySerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)

    class Meta:
        model = UserInventory
        fields = ['id', 'reward', 'is_equipped', 'acquired_at']
