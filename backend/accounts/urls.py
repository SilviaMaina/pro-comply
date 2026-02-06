from django.urls import path
from .views import ProfileView, EngineerDetailView, sync_firebase_user, test_auth, delete_profile_photo

urlpatterns = [
    path('sync-firebase/', sync_firebase_user, name='sync-firebase'),
    path('test-auth/', test_auth, name='test-auth'),
    path('engineer/', EngineerDetailView.as_view(), name='engineer-detail'),  # New
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/photo/delete/', delete_profile_photo, name='delete-profile-photo'),
    
]