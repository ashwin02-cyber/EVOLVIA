from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestlineViewSet

router = DefaultRouter()
router.register(r'', QuestlineViewSet, basename='questlines')

urlpatterns = [
    path('', include(router.urls)),
]
