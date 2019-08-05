from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, HttpResponseForbidden
from django. urls import reverse_lazy
from core. models import Profile, Restaurant, Favorite
import json
import requests
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings


def index(request):
    return render(request, 'index.html')

def rankings(request):
    return render(request, 'core/rankings.html')


@login_required
def user_profile(request):
    user = Profile.objects.filter(user=request.user)
    favorites = Restaurant.objects.filter()
    
    context = {
        'user' : user,
        'favorites' : favorites,
        
    }
    return render(request, 'core/user_profile.html', context)

@login_required
def create_favorite(request, permitid, name):
    user = Profile.objects.get(user=request.user)
    restaurant = Restaurant(permitid=permitid, name=name)
    restaurant.save()
    user.favorites.add(restaurant)

    context = {
        'user' : user,
        'restaurant' : restaurant,
        
        
    }
    return render(request, 'core/user_profile.html', context)
    

    




def yelp_search(request, term, longitude, latitude, limit):
    api_key='LXc_1CXYWbpCcRrhXYCQ8UVdROphcKPdlDoR-EC9GGadzfBh-iTLBpqmhNPCI3_on1IroKPRcFNWffn3Y3orgE50ho4k0j-VABxhBrJgPrsfn7RssZavS4-S47k9XXYx'
    headers = {'Authorization': f'Bearer {api_key}'}
    url='https://api.yelp.com/v3/businesses/search'
    params = {
        'term': term,
        'longitude': longitude,
        'latitude': latitude,
        'limit': limit,
    }
    req=requests.get(url, params=params, headers=headers)
    return JsonResponse(json.loads(req.text))


