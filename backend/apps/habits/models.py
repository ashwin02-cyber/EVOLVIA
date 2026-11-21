from django.db import models
from django.conf import settings

class Habit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=80)
    icon = models.CharField(max_length=30, default='Layers')
    color_token = models.CharField(max_length=20, default='cyan')
    frequency = models.JSONField(default=dict, blank=True)
    target_time = models.TimeField(null=True, blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (Streak: {self.current_streak})"


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    log_date = models.DateField()
    note = models.CharField(max_length=200, blank=True, default='')
    xp_awarded = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('habit', 'log_date')
