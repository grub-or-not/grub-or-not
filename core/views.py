from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, HttpResponseForbidden
from django. urls import reverse_lazy
from core. models import Profile
import json
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
    context = {
        'user' : user,
    }
    return render(request, 'core/user_profile.html', context)

# Below is new code for charts

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.generic import View
from rest_framework.views import APIView
from rest_framework.response import Response


User = get_user_model()
class HomeView(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'charts.html', {"customers": 10})



def get_data(request, *args, **kwargs):
    data = {
        "sales": 100,
        "customers": 10,
    }
    return JsonResponse(data) # http response


class ChartData(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        qs_count = User.objects.all().count()
        labels = ["Users", "Blue", "Yellow", "Green", "Purple", "Orange"]
        default_items = [qs_count, 23, 2, 3, 12, 2]
        data = {
                "labels": labels,
                "default": default_items,
        }
        return Response(data)

