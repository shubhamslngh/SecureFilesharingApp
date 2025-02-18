from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'Regular User'),
        ('guest', 'Guest'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    def is_staff(self):
        return self.role == self.admin
   
    def __str__(self):
        return self.username# Change the related names for the groups and user_permissions fields.
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",  # changed related name
        blank=True,
        help_text="The groups this user belongs to.",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_set",  # changed related name
        blank=True,
        help_text="Specific permissions for this user.",
        related_query_name="custom_user",
    )
