from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestViewSet, QuestCategoryViewSet

router = DefaultRouter()
router.register(r'categories', QuestCategoryViewSet, basename='quest-categories')
router.register(r'', QuestViewSet, basename='quests')

urlpatterns = [
    path('', include(router.urls)),
]
