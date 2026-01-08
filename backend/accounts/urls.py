from django.urls import path
from .views import RegisterEngineerView, LoginEngineerView

urlpatterns = [
    path('register/', RegisterEngineerView.as_view(), name='register_engineer'),
    path('login/', LoginEngineerView.as_view(), name='login_engineer'),
]
