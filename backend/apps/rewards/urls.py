from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardViewSet, InventoryViewSet, LeaderboardView

router = DefaultRouter()
router.register(r'shop', RewardViewSet, basename='rewards-shop')
router.register(r'inventory', InventoryViewSet, basename='user-inventory')

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('', include(router.urls)),
]
