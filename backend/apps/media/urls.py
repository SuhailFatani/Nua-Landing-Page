from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_media),
    path('upload/', views.upload_media),
    path('<str:uid>/', views.update_media),
    path('<str:uid>/delete/', views.delete_media),
]
