from django.contrib import admin
from core.models import Profile, Restaurant, Favorite


# Register your models here.

admin.site.register(Profile)
admin.site.register(Restaurant)
admin.site.register(Favorite)
