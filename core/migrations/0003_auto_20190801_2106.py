# Generated by Django 2.2.3 on 2019-08-01 21:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20190801_2049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='favorites',
            field=models.ManyToManyField(through='core.Favorite', to='core.Restaurant'),
        ),
    ]