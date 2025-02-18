# filesharing/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import secrets
# Custom user model with role field
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('guest', 'Guest'),
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )

    def save(self, *args, **kwargs):
        if self.role == 'admin':  # <-- this matches the DB value
            self.is_staff = True
        else:
            self.is_staff = False
        super().save(*args, **kwargs)

# Model to store file metadata
class File(models.Model):
    owner = models.ForeignKey(User, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    iv = models.CharField(max_length=100, help_text="Initialization vector for client-side encryption")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.CharField(max_length=100, help_text="Name of the user who uploaded the file", blank=True)

    def save(self, *args, **kwargs):
        # If uploaded_by isn't already set, and we have an owner
        if not self.uploaded_by and self.owner:
            self.uploaded_by = self.owner.username
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.owner.username} - {self.file.name}"

from django.conf import settings
PERMISSION_CHOICES = (
    ('view', 'View'),
    ('download', 'Download'),

)
# Model to store shareable links
class FileShare(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_with = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='shared_files')
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    token = models.CharField(max_length=64, unique=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Generate a token if it doesn’t exist
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.file} shared with {self.shared_with.all()} (perm: {self.permission})"
