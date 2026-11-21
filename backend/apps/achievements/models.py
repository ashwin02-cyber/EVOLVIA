from django.db import models
from django.conf import settings

class Achievement(models.Model):
    RARITY_CHOICES = [
        ('COMMON', 'Common'),
        ('RARE', 'Rare'),
        ('EPIC', 'Epic'),
        ('LEGENDARY', 'Legendary'),
    ]

    code = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=60)
    description = models.CharField(max_length=200)
    criteria_text = models.CharField(max_length=80)
    rule = models.JSONField(default=dict)
    rarity = models.CharField(max_length=15, choices=RARITY_CHOICES, default='COMMON')
    xp_bonus = models.IntegerField(default=50)
    crystal_bonus = models.IntegerField(default=10)
    icon_key = models.CharField(max_length=60, default='BookOpen')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.rarity})"


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_achievements')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"
