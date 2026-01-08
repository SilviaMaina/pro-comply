from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt import tokens
from .serializers import EngineerRegistrationSerializer, EngineerLoginSerializer


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