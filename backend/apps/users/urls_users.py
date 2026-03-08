from django.urls import path
from . import views_users

urlpatterns = [
    path('', views_users.list_users),
    path('create/', views_users.create_user),
    path('audit-log/', views_users.audit_log),
    path('<str:uid>/', views_users.update_user),
    path('<str:uid>/delete/', views_users.delete_user),
]
