from django.db import models
from django.conf import settings

class Reward(models.Model):
    TYPE_CHOICES = [
        ('FRAME', 'Avatar Frame'),
        ('THEME', 'UI Accent Theme'),
        ('STREAK_FREEZE', 'Streak Freeze Protocol'),
        ('TITLE', 'Player Title Tag'),
    ]

    code = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='FRAME')
    cost_crystals = models.IntegerField(default=10)
    icon_key = models.CharField(max_length=60, default='Gem')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.cost_crystals} Crystals)"


class UserInventory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inventory')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE, related_name='owned_by')
    is_equipped = models.BooleanField(default=False)
    acquired_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'reward')

    def __str__(self):
        return f"{self.user.username} owns {self.reward.name}"


class CrystalTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='crystal_transactions')
    amount = models.IntegerField()
    reason = models.CharField(max_length=60)
    ref = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
