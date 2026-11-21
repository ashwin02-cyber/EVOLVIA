from django.db import models
from django.conf import settings

class Questline(models.Model):
    RARITY_CHOICES = [
        ('COMMON', 'Common'),
        ('RARE', 'Rare'),
        ('EPIC', 'Epic'),
        ('LEGENDARY', 'Legendary'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='questlines')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    rarity = models.CharField(max_length=15, choices=RARITY_CHOICES, default='EPIC')
    banner_key = models.CharField(max_length=60, default='questline_portal')
    is_pinned = models.BooleanField(default=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ACTIVE')
    completed_at = models.DateTimeField(null=True, blank=True)
    bonus_xp = models.IntegerField(default=350)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.rarity})"


class QuestlineMilestone(models.Model):
    questline = models.ForeignKey(Questline, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=100)
    order = models.IntegerField(default=1)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    xp_reward = models.IntegerField(default=50)

    class Meta:
        ordering = ['order']
        unique_together = ('questline', 'order')

    def __str__(self):
        return f"{self.questline.title} - Step {self.order}: {self.title}"
