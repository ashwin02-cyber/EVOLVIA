from django.urls import path
from .views import XPAnalyticsView, QuestAnalyticsView, FocusAnalyticsView

urlpatterns = [
    path('xp/', XPAnalyticsView.as_view(), name='analytics-xp'),
    path('quests/', QuestAnalyticsView.as_view(), name='analytics-quests'),
    path('focus/', FocusAnalyticsView.as_view(), name='analytics-focus'),
]
