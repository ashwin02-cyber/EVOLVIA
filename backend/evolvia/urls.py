from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API v1 Endpoints
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/quests/', include('apps.quests.urls')),
    path('api/v1/focus/', include('apps.focus.urls')),
    path('api/v1/habits/', include('apps.habits.urls')),
    path('api/v1/achievements/', include('apps.achievements.urls')),
    path('api/v1/questlines/', include('apps.questlines.urls')),
    path('api/v1/rewards/', include('apps.rewards.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/ai/', include('apps.ai_assistant.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
