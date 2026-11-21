from django.urls import path
from .views import DashboardView, ClaimDailyRewardView, HealthView

urlpatterns = [
    path('health/', HealthView.as_view(), name='health'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('rewards/daily-login/claim/', ClaimDailyRewardView.as_view(), name='daily-login-claim'),
]
