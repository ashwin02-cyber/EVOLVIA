from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=60, default='')
    title_tagline = models.CharField(max_length=60, default='Productivity Explorer')
    avatar_key = models.CharField(max_length=60, default='avatar_01')
    avatar_image = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    timezone = models.CharField(max_length=64, default='Asia/Kolkata')
    total_xp = models.BigIntegerField(default=0)
    level = models.IntegerField(default=1)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    crystals = models.IntegerField(default=0)
    weekly_xp_goal = models.IntegerField(default=620)
    settings = models.JSONField(default=dict, blank=True)
    onboarded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.display_name or self.user.username} (Lvl {self.level})"
