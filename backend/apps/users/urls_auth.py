from django.urls import path
from . import views_auth

urlpatterns = [
    path('login/', views_auth.login),
    path('refresh/', views_auth.refresh),
    path('logout/', views_auth.logout),
    path('logout-all/', views_auth.logout_all),
    path('me/', views_auth.me),
    path('change-password/', views_auth.change_password),
]
