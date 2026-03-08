from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_pages),
    path('admin/all/', views.admin_list_pages),
    path('<str:slug>/', views.get_page),
    path('<str:slug>/update/', views.upsert_page),
]
