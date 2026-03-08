from django.urls import path
from . import views

urlpatterns = [
    path('pageview/', views.track_pageview),
    path('event/', views.track_event),
    path('booking/', views.submit_booking),
    path('dashboard/', views.dashboard),
    path('realtime/', views.realtime),
    path('bookings/', views.list_bookings),
]
