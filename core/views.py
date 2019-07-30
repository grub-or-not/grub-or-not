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