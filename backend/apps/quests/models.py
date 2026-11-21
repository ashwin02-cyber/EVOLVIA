from django.db import models
from django.conf import settings

class QuestCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=50)
    color_token = models.CharField(max_length=20, default='cyan')
    icon = models.CharField(max_length=30, default='BookOpen')

    def __str__(self):
        return self.name


class Quest(models.Model):
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
        ('EPIC', 'Epic'),
    ]

    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quests')
    category = models.ForeignKey(QuestCategory, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True, default='')
    difficulty = models.CharField(max_length=8, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    xp_reward = models.IntegerField(default=50)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='TODO')
    due_at = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.IntegerField(null=True, blank=True, default=30)
    recurrence = models.JSONField(null=True, blank=True)
    instance_date = models.DateField(null=True, blank=True)
    is_challenge = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.difficulty} - {self.xp_reward} XP)"


class QuestCompletion(models.Model):
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE, related_name='completions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    was_late = models.BooleanField(default=False)
    multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    xp_awarded = models.IntegerField()
    reversed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Completion: {self.quest.title} (+{self.xp_awarded} XP)"
