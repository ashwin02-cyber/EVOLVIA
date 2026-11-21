from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ('LEVEL_UP', 'Level Up'),
        ('ACHIEVEMENT', 'Achievement Unlocked'),
        ('STREAK_RISK', 'Streak at Risk'),
        ('REWARD', 'Daily Reward Available'),
        ('SYSTEM', 'System Announcement'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='SYSTEM')
    title = models.CharField(max_length=100)
    body = models.CharField(max_length=240)
    link = models.CharField(max_length=120, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
