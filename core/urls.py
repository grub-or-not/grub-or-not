from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('browse/', views.browse, name='browse'),
    path('profile/', views.user_profile, name="my_profile"),
    path('yelp/<term>/<longitude>/<latitude>/<limit>/', views.yelp_search, name="yelp_search"),
    path('favorite/<permitid>/<name>/', views.create_favorite, name="create_favorite"),
    path('favorite/delete/<pk>/', views.delete_favorite, name="delete_favorite"),
   
]