from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_posts),                      # GET — public list
    path('admin/all/', views.admin_list_posts),       # GET — admin/editor all posts
    path('create/', views.create_post),               # POST — create
    path('<str:uid>/update/', views.update_post),     # PATCH — update
    path('<str:uid>/delete/', views.delete_post),     # DELETE — delete
    path('<str:slug>/', views.get_post),              # GET — public single (must be last)
]
