from django.db import models
from django.conf import settings

class XPTransaction(models.Model):
    SOURCE_TYPES = [
        ('QUEST', 'Quest'),
        ('HABIT', 'Habit'),
        ('FOCUS', 'Focus Session'),
        ('LOGIN', 'Login Reward'),
        ('CHALLENGE', 'Challenge'),
        ('MILESTONE', 'Questline Milestone'),
        ('QUESTLINE', 'Questline Arc Completion'),
        ('ACHIEVEMENT', 'Achievement Unlock'),
        ('REVERSAL', 'Undo Reversal'),
        ('ADJUSTMENT', 'Admin Adjustment'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp_transactions')
    amount = models.IntegerField()
    base_amount = models.IntegerField()
    multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    source_id = models.CharField(max_length=64)
    balance_after = models.BigIntegerField()
    level_after = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} {self.source_type} ({self.amount:+d} XP) -> Lvl {self.level_after}"


class UserLevel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='level_history')
    level = models.IntegerField()
    rank = models.CharField(max_length=40)
    reached_at = models.DateTimeField(auto_now_add=True)
    xp_at_reach = models.BigIntegerField()

    class Meta:
        unique_together = ('user', 'level')
        ordering = ['-level']


class LoginReward(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_rewards')
    claim_date = models.DateField()
    xp_awarded = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'claim_date')
