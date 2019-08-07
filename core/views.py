from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, HttpResponseForbidden
from django.urls import reverse, reverse_lazy
from core. models import Profile, Restaurant, Favorite
import json
import requests
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime
from pprint import pprint


def index(request):
    return render(request, 'index.html')

def browse(request):

    # get all inspections ordered by DATE_
    inspectionsApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?where=1%3D1&orderBy=DATE_&orderByAsc=false&outFields=*&outSR=4326&f=json&orderByFields=DATE_%20DESC'
    inspectionsApiResponse = requests.get(inspectionsApi)
    inspections = json.loads(inspectionsApiResponse.text)['features']

    # take 10 most recent inspections
    recent_inspections = []
    for i in range(0, 10):
        recent_inspections.append(inspections[i])

    # convert inspection dates to python datetime
    for inspection in recent_inspections:
        inspection_date = inspection['attributes']['DATE_']
        s = inspection_date / 1000.0
        inspection['attributes']['DATE_'] = datetime.fromtimestamp(s).strftime('%m/%d/%Y')

    # query the restaurant info of the last 5 inspections and add to recent_inspections
    for inspection in recent_inspections:
        restaurantsApi = create_restaurants_api_endpoint(inspection['attributes']['PERMITID'])
        restaurantsApiResponse = requests.get(restaurantsApi)
        restaurant = json.loads(restaurantsApiResponse.text)['features']

        yelpApi = request.build_absolute_uri(reverse("yelp_search", args = [
            restaurant[0]['attributes']['NAME'],
            restaurant[0]['attributes']['X'],
            restaurant[0]['attributes']['Y'],
            1,
        ]))
        yelpApiResponse = requests.get(yelpApi)
        yelp = json.loads(yelpApiResponse.text)

        inspection['attributes'].update({
            'NAME': restaurant[0]['attributes']['NAME'],
            'ADDRESS1': restaurant[0]['attributes']['ADDRESS1'],
            'CITY': restaurant[0]['attributes']['CITY'],
            'POSTALCODE': restaurant[0]['attributes']['POSTALCODE'],
            'PHONENUMBER': restaurant[0]['attributes']['PHONENUMBER'],
        })

        if yelp['businesses']:
            pprint(yelp['businesses'][0])
            inspection['attributes'].update({
                'YELP_RATING': yelp['businesses'][0]['rating'],
                'YELP_NUM_RATINGS': yelp['businesses'][0]['review_count'],
            })

    return render(request, 'core/browse.html', {
        'recent_inspections': recent_inspections,
    })


def create_restaurants_api_endpoint(permit_id):
    return f'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=PERMITID%20%3D%20{permit_id}'


@login_required
def user_profile(request):
    profile = Profile.objects.get(user=request.user)
    favorites = Favorite.objects.filter(profile=profile)
    
    context = {
        'profile' : profile,
        'favorites' : favorites,
        
    }
    return render(request, 'core/user_profile.html', context)


@login_required
def create_favorite(request, permitid, name):
    profile = Profile.objects.get(user=request.user)
    restaurant = Restaurant(permitid=permitid, name=name)
    restaurant.save()
    profile.favorites.add(restaurant)

    context = {
        'profile' : profile,
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