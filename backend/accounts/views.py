from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model
from .models import UserProfile
from .serializers import UserProfileSerializer, EngineerSerializer
from .service.email_service import send_welcome_email

import json
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
@require_POST
def sync_firebase_user(request):
    """
    Sync Firebase user with Django user
    """
    try:
        data = json.loads(request.body)
        firebase_uid = data.get('firebase_uid')
        email = data.get('email')
        name = data.get('name', '')
        
        if not firebase_uid or not email:
            return JsonResponse({
                'error': 'Missing required fields',
                'required': ['firebase_uid', 'email']
            }, status=400)
        
        # Split name into first/last
        name_parts = name.split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Get or create Django user
        user, created = User.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        logger.info(f"User sync: {email} ({'created' if created else 'exists'})")
        
        return JsonResponse({
            'status': 'success',
            'user_id': user.id,
            'email': user.email,
            'created': created
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Sync error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_auth(request):
    """Test endpoint to verify authentication"""
    return Response({
        'message': 'Authentication successful!',
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'firebase_uid': request.user.firebase_uid,
            'ebk_registration_number': request.user.ebk_registration_number,
        }
    })


class EngineerDetailView(APIView):
    """Get/Update Engineer (auth user) info"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current engineer info"""
        serializer = EngineerSerializer(request.user)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    def patch(self, request):
        """Update engineer info (partial update)"""
        serializer = EngineerSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Engineer info updated: {request.user.email}")
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        
        logger.warning(f"Engineer update validation failed: {serializer.errors}")
        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileView(APIView):
    """Get/Update UserProfile with nested Engineer fields"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get complete profile (Engineer + UserProfile)"""
        try:
            profile, created = UserProfile.objects.get_or_create(engineer=request.user)
            serializer = UserProfileSerializer(profile)
            
            logger.info(f"Profile accessed by: {request.user.email}")
            
            return Response({
                'status': 'success',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Profile GET error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request):
        """Full update of profile"""
        return self._update_profile(request, partial=False)
    
    def patch(self, request):
        """Partial update of profile"""
        return self._update_profile(request, partial=True)
    
    def _update_profile(self, request, partial=False):
        """Helper method to update profile (handles both Engineer and UserProfile)"""
        try:
            profile, created = UserProfile.objects.get_or_create(engineer=request.user)

            
            serializer = UserProfileSerializer(
                profile,
                data=request.data,
                partial=partial
            )
            
            if serializer.is_valid():
                serializer.save()
                
                logger.info(f"Profile updated by: {request.user.email}")
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
            
            logger.warning(f"Profile update validation failed: {serializer.errors}")
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_photo(request):
    """Delete profile photo"""
    try:
        profile = UserProfile.objects.get(engineer=request.user)
        
        if profile.profile_photo:
            # Delete from Cloudinary
            profile.profile_photo.delete()
            profile.save()
            
            logger.info(f"Profile photo deleted for {request.user.email}")
            
            return Response({
                'status': 'success',
                'message': 'Profile photo deleted successfully'
            })
        else:
            return Response(
                {'error': 'No profile photo to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting profile photo: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )    