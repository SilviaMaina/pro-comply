from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework_simplejwt import tokens
from .serializers import EngineerRegistrationSerializer, EngineerLoginSerializer, UserProfileSerilizer


# Create your views here.
class RegisterEngineerView(APIView):
    def post(self, request):
        serializer = EngineerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            engineer = serializer.save()
            return Response({
                "message": "Engineer registered successfully!",
                "engineer": {
                    "email": engineer.email,
                    "first_name": engineer.first_name,
                    "last_name": engineer.last_name,
                    "ebk_registration_number": engineer.ebk_registration_number

                }
                
                },
                  status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginEngineerView(APIView):
    def post(self, request):
        serializer = EngineerLoginSerializer(data=request.data)
        if serializer.is_valid():
            engineer = serializer.validated_data['engineer']
            refresh = tokens.RefreshToken.for_user(engineer)
            return Response({
                "message": "Login successful!",
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "engineer": {
                    "email": engineer.email,
                    "first_name": engineer.first_name,
                    "last_name": engineer.last_name,
                    "ebk_registration_number": engineer.ebk_registration_number
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]    
    
    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(engineer=request.user)
        serializer = UserProfileSerilizer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, created = UserProfile.objects.get_or_create(engineer=request.user)    
        serializer = UserProfileSerilizer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)