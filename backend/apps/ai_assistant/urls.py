from django.urls import path
from .views import AIStatusView, AIChatView, PlanDayView, PlanDayAcceptView

urlpatterns = [
    path('status/', AIStatusView.as_view(), name='ai-status'),
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('plan-day/', PlanDayView.as_view(), name='ai-plan-day'),
    path('plan-day/accept/', PlanDayAcceptView.as_view(), name='ai-plan-day-accept'),
]
