from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('browse/', views.browse, name='browse'),
    path('about/', views.about, name='about'),
    path('yelp/<term>/<longitude>/<latitude>/<limit>/', views.yelp_search, name="yelp_search"),
]