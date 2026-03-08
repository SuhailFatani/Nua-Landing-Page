"""Root URL configuration for Nua Security backend."""
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'nua-backend'})


urlpatterns = [
    path('health/', health_check),
    path('api/auth/', include('apps.users.urls_auth')),
    path('api/users/', include('apps.users.urls_users')),
    path('api/blog/', include('apps.blog.urls')),
    path('api/pages/', include('apps.pages.urls')),
    path('api/media/', include('apps.media.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]
