from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from datetime import timedelta
from .models import File, FileShare

User = get_user_model()

# ========================= User Serializers =========================

# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        # Additional MFA setup can be triggered here
        return user

# User Login Serializer (includes a placeholder for MFA)
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    mfa_code = serializers.CharField(write_only=True, required=False)  # MFA code field (optional)
    
    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user  # Store the user in validated data
        return data


# ========================= File Handling Serializers =========================

# File Upload Serializer
class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_by', 'iv']


    def create(self, validated_data):
        owner = self.context['request'].user  # The owner is provided via request context
        file_instance = File.objects.create( **validated_data)
        return file_instance

# Fetch all uploaded files for the user
class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_at','uploaded_by']


# ========================= File Sharing Serializers =========================

# FileShare Serializer
class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = ['id', 'file', 'token', 'expires_at', 'permission']
        read_only_fields = ['token']  # Token is auto-generated and should not be editable
    
    def create(self, validated_data):
        # Set default expiry time if not provided (e.g., 60 minutes from now)
        if 'expires_at' not in validated_data:
            validated_data['expires_at'] = timezone.now() + timedelta(minutes=60)
        share_instance = FileShare.objects.create(**validated_data)
        return share_instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Include fields you want to expose (adjust as necessary)
        fields = ['id', 'username', 'email']