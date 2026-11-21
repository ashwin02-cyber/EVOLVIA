from django.db import models
from django.conf import settings
from apps.quests.models import Quest

class FocusSession(models.Model):
    MODE_CHOICES = [
        ('POMODORO', 'Pomodoro'),
        ('DEEP_WORK', 'Deep Work'),
        ('STUDY', 'Study Sprint'),
        ('CUSTOM', 'Custom'),
    ]

    STATUS_CHOICES = [
        ('RUNNING', 'Running'),
        ('PAUSED', 'Paused'),
        ('COMPLETED', 'Completed'),
        ('ABANDONED', 'Abandoned'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_sessions')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='POMODORO')
    planned_seconds = models.IntegerField(default=1500)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='RUNNING')
    paused_total_seconds = models.IntegerField(default=0)
    pause_count = models.IntegerField(default=0)
    paused_at = models.DateTimeField(null=True, blank=True)
    quest = models.ForeignKey(Quest, on_delete=models.SET_NULL, null=True, blank=True)
    xp_awarded = models.IntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} {self.mode} ({self.planned_seconds // 60}m) - {self.status}"
