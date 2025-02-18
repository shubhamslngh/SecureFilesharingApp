from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken  # JWT authentication
from django.http import FileResponse, Http404, JsonResponse
from django.utils import timezone
from datetime import timedelta

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    FileUploadSerializer,
    FileShareSerializer,
    UploadedFileSerializer,
    UserSerializer
)
from .models import File, FileShare

User = get_user_model()

# ========================= User Authentication Endpoints =========================

# User Registration
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# User Login
class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Issue JWT tokens upon successful authentication
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': user.role,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)

# User Logout
class UserLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # For JWT, you might blacklist the token if using the blacklist app.
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


# ========================= File Upload, Download & Fetching =========================

# File Upload
class FileUploadView(generics.CreateAPIView):
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# Fetch all files uploaded by the authenticated user
class UserUploadedFilesView(generics.ListAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # If the user is a staff member (or admin), return all files
        print(self.request.user.is_staff)
        if self.request.user.is_staff:
            return File.objects.all()
        # Otherwise, return only the files owned by the user
        return File.objects.filter(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"files": serializer.data})
    
class GetIVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id)
        except File.DoesNotExist:
            raise Http404("File not found")

        # Check if user has permission
        if file_obj.owner != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        print(file_obj.iv)
        # Return IV separately in JSON response
        return Response({"iv": file_obj.iv, "filename": file_obj.file.name})

class FileDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, file_id):
        # Only allow admin users to delete files.
        if not request.user.is_staff:
            return Response(
                {"error": "Only administrators can delete files."},
                status=status.HTTP_403_FORBIDDEN
            )

        file_obj = get_object_or_404(File, id=file_id)

        file_obj.delete()

        return Response(
            {"message": "File deleted successfully."},
            status=status.HTTP_200_OK
        )

class FileDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id)
        except File.DoesNotExist:
            raise Http404("File not found")

        # Check if the user has permission to download
        if file_obj.owner != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        # Serve the file as a response
        file_handle = file_obj.file.open('rb')
        response = FileResponse(file_handle, as_attachment=True, filename=file_obj.file.name)
        return response



# ========================= File Sharing & Generating Links =========================
# views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from .models import File, FileShare

User = get_user_model()

class CreateFileShareView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_id = request.data.get('file_id')
        shared_with_ids = request.data.get('shared_with')  # Expect a list of user IDs
        permission = request.data.get('permission', 'view')  # default to view permission
        expires_in_minutes = int(request.data.get('expires_in', 60))  # default to 60 minutes
        print(request.data)

        # Validate file
        try:
            file_obj = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Optionally: Check if the current user is allowed to share the file
        print("uploaded by",file_obj.uploaded_by)
        print("req user ",request.user)
        if file_obj.uploaded_by != request.user.username: 
            return Response({'error': 'You are not allowed to share this file.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Validate shared_with users
        users = User.objects.filter(id__in=shared_with_ids)
        if not users.exists():
            return Response({'error': 'No valid users to share with.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Set the expiration datetime
        expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)

        # Create the FileShare object
        file_share = FileShare.objects.create(
            file=file_obj,
            permission=permission,
            expires_at=expires_at,
        )
        file_share.shared_with.set(users)
        file_share.save()

        # Build a shareable link (adjust your URL structure as needed)
        share_link = request.build_absolute_uri(f"/api/access-share/{file_share.token}/")
        return Response({'share_link': share_link, 'expires_at': expires_at}, status=status.HTTP_201_CREATED)

    # views.py (continued)
from django.http import FileResponse

class AccessSharedFileView(APIView):
    permission_classes = [permissions.AllowAny]  # Depending on your design

    def get(self, request, token):
        try:
            file_share = FileShare.objects.get(token=token)
        except FileShare.DoesNotExist:
            return Response({'error': 'Invalid share link.'}, status=status.HTTP_404_NOT_FOUND)

        if file_share.is_expired():
            return Response({'error': 'Share link expired.'}, status=status.HTTP_410_GONE)

        # Optionally enforce that the requesting user is in the allowed list.
        # For example, if you want to require login:
        # if not request.user.is_authenticated or request.user not in file_share.shared_with.all():
        #     return Response({'error': 'You are not authorized to access this file.'},
        #                     status=status.HTTP_403_FORBIDDEN)

        # Depending on the permission, return a file download or view response.
        file_obj = file_share.file
        if file_share.permission == 'download':
            response = FileResponse(file_obj.file, as_attachment=True, filename=file_obj.file.name)
        else:
            # For viewing, you might render the file in-browser.
            response = FileResponse(file_obj.file)
        return response

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]