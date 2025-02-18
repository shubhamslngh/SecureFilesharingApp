from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    FileUploadView,
    UserUploadedFilesView,
    FileDownloadView,
    CreateFileShareView,
    GetIVView,
    FileDeleteView, CreateFileShareView, AccessSharedFileView,UserListAPIView

)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("logout/", UserLogoutView.as_view(), name="user-logout"),
    path("upload-file/", FileUploadView.as_view(), name="upload-file"),
    path("uploads/", UserUploadedFilesView.as_view(), name="user-uploads"),
    path("download/<int:file_id>/", FileDownloadView.as_view(), name="download-file"),
    path('download/<int:file_id>/iv', GetIVView.as_view(), name='get-file-iv'),
    path("delete/<int:file_id>/", FileDeleteView.as_view(), name="delete-file"),
    path('create-share/', CreateFileShareView.as_view(), name='create_file_share'),
    path('access-share/<str:token>/', AccessSharedFileView.as_view(), name='access_shared_file'),
    path('users/', UserListAPIView.as_view(), name='user-list'),
]
