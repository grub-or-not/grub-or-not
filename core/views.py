from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse
from core. models import Profile, Restaurant, Favorite
import json
import requests
from django.contrib.auth.decorators import login_required
from datetime import datetime
import re


def index(request):
    return render(request, 'index.html')


def about(request):
    return render(request, 'core/about.html')


def browse(request):

    ## RECENT INSPECTIONS
    # get all inspections ordered by DATE_
    inspections_ordered_by_date = get_all_inspections_ordered_by_date()

    # take 5 most recent inspections
    recent_inspections = take_five_inspections(inspections_ordered_by_date)

    for inspection in recent_inspections:
        # convert inspection date to readable format
        inspection['attributes']['DATE_'] = convert_inspection_date_to_readable_format(inspection['attributes']['DATE_'])

        # get the inspected restaurant
        restaurant = get_inspected_restaurant_info(inspection)

        if restaurant:
            inspection['attributes'].update({
                'NAME': restaurant['NAME'],
                'ADDRESS1': restaurant['ADDRESS1'],
                'CITY': restaurant['CITY'],
                'POSTALCODE': restaurant['POSTALCODE'],
                'PHONENUMBER': restaurant['PHONENUMBER'],
            })

            yelp_restaurant = get_restaurant_from_yelp(request, restaurant)

            if yelp_restaurant:
                inspection['attributes'].update({
                    'YELP_RATING': yelp_restaurant[0]['rating'],
                    'YELP_NUM_RATINGS': yelp_restaurant[0]['review_count'],
                })

    ## LOWEST SANITATION SCORES
    # get all inspections ordered by score and > 70
    inspections_orderby_score = get_all_inspections_higher_than_70_ordered_by_score()

    # take 5 and query the restaurant info
    lowest_inspections = take_five_inspections(inspections_orderby_score)

    for inspection in lowest_inspections:
        # convert inspection date to readable format
        inspection['attributes']['DATE_'] = convert_inspection_date_to_readable_format(inspection['attributes']['DATE_'])
        

        # query the restaurant info and add to lowest_inspections
        restaurantsApi = create_restaurants_api_endpoint(inspection['attributes']['PERMITID'])
        restaurantsApiResponse = requests.get(restaurantsApi)
        restaurant = json.loads(restaurantsApiResponse.text)['features']
        
        if restaurant:
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
                inspection['attributes'].update({
                    'YELP_RATING': yelp['businesses'][0]['rating'],
                    'YELP_NUM_RATINGS': yelp['businesses'][0]['review_count'],
                })


    return render(request, 'core/browse.html', {
        'recent_inspections': recent_inspections,
        'lowest_inspections': lowest_inspections,
    })


def get_all_inspections_ordered_by_date():
    """
    Call the Wake County Restaurant Inspections API and get all the restaurant inspections ordered by date in descending order (most recent first).
    """
    inspections_orderby_date_api = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?where=1%3D1&orderBy=DATE_&orderByAsc=false&outFields=*&outSR=4326&f=json&orderByFields=DATE_%20DESC'
    inspectionsApiResponse = requests.get(inspections_orderby_date_api)
    return json.loads(inspectionsApiResponse.text)['features']


def take_five_inspections(inspections):
    """
    From a list of inspections, return the first five.
    """
    five_inspections = []
    for i in range(0, 5):
        five_inspections.append(inspections[i])

    return five_inspections


def convert_inspection_date_to_readable_format(inspection_date):
    """
    Convert an inspection date to a readable format.
    Example output: 08/07/2019
    """
    date = inspection_date / 1000.0
    return datetime.fromtimestamp(date).strftime('%m/%d/%Y')


def get_inspected_restaurant_info(inspection):
    """
    Call the Wake County Restaurant API and get the inspected restaurant information.
    """
    restaurants_api_endpoint = create_restaurants_api_endpoint(inspection['attributes']['PERMITID'])
    restaurants_api_response = requests.get(restaurants_api_endpoint)
    return json.loads(restaurants_api_response.text)['features'][0]['attributes']


def create_restaurants_api_endpoint(permit_id):
    """
    Create the Wake County Restaurants API using the supplied PERMITID.
    """
    return f'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=PERMITID%20%3D%20{permit_id}'


def remove_number_symbols_from_restaurant_name_for_yelp_search(restaurant_name):
    regex = r"\s+#.*"
    subst = ""
    return re.sub(regex, subst, restaurant_name, 0, re.MULTILINE)


def remove_parentheses_from_restaurant_name_for_yelp_search(restaurant_name):
    regex = r"\s*\([^)]*\)"
    subst = ""
    return re.sub(regex, subst, restaurant_name, 0, re.MULTILINE)


def create_yelp_search_endpoint(request, restaurant):
    """
    Create the endpoint to the yelp_search view function.
    """
    restaurant_name = restaurant['NAME']
    restaurant_name = remove_parentheses_from_restaurant_name_for_yelp_search(restaurant_name)
    restaurant_name = remove_number_symbols_from_restaurant_name_for_yelp_search(restaurant_name)
    return request.build_absolute_uri(reverse("yelp_search", args = [
        restaurant_name,
        restaurant['X'],
        restaurant['Y'],
        1,
    ]))


def get_restaurant_from_yelp(request, restaurant):
    """
    Get the restaurant(s) returned from a yelp search.
    """
    yelp_search_endpoint = create_yelp_search_endpoint(request, restaurant)
    yelp_search_response = requests.get(yelp_search_endpoint)
    if json.loads(yelp_search_response.text)['businesses']:
        return json.loads(yelp_search_response.text)['businesses']
    else:
        return None


def get_all_inspections_higher_than_70_ordered_by_score():
    inspections_higher_than_70_ordered_by_score_api = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?outFields=*&outSR=4326&f=json&orderByFields=SCORE&where=SCORE%20%3E%3D%2070'
    inspections_higher_than_70_ordered_by_score_response = requests.get(inspections_higher_than_70_ordered_by_score_api)
    return json.loads(inspections_higher_than_70_ordered_by_score_response.text)['features']
    

def yelp_search(request, term, longitude, latitude, limit):
    """
    Search the yelp API and return JSON results.
    """
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