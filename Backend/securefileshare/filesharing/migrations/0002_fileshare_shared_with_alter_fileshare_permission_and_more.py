# Generated by Django 4.2.18 on 2025-02-06 19:14

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filesharing', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fileshare',
            name='shared_with',
            field=models.ManyToManyField(related_name='shared_files', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='fileshare',
            name='permission',
            field=models.CharField(choices=[('view', 'View'), ('download', 'Download')], max_length=10),
        ),
        migrations.AlterField(
            model_name='fileshare',
            name='token',
            field=models.CharField(blank=True, max_length=64, unique=True),
        ),
    ]
