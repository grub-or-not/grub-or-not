from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('rankings/', views.rankings, name='rankings'),
    path('profile/', views.user_profile, name="my_profile"),
    path('yelp/<term>/<longitude>/<latitude>/<limit>/', views.yelp_search, name="yelp_search"),
]