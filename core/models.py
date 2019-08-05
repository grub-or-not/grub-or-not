from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


# Create your models here.

class Profile(models.Model):
    """       """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorites = models.ManyToManyField('Restaurant', through='Favorite')
    

    

    def __str__(self):
        """    """
        return self.user.username

class Restaurant(models.Model):
    """      """
    name = models.CharField(max_length=100)
    permitid = models.CharField(null=True, max_length=20)

    def __str__(self):
        """    """
        return self.name

    

class Favorite(models.Model):
    """  """
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    def __str__(self):
        """    """
        return self.restaurant


    

