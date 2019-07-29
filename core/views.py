from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def rankings(request):
    return render(request, 'core/rankings.html')