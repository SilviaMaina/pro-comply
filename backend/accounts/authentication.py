from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from firebase_admin import auth
from rest_framework import authentication
from rest_framework import exceptions
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    DRF authentication class for Firebase tokens
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
            
        if not auth_header.startswith('Bearer '):
            return None
            
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            
            if not email:
                raise exceptions.AuthenticationFailed('No email found in Firebase token')
            
            # Split name into first/last
            name_parts = name.split(' ', 1)
            first_name = name_parts[0] if name_parts else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Get or create user
            user, created = User.objects.get_or_create(
                firebase_uid=uid,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True,
                }
            )
            
            if created:
                logger.info(f"Created new user: {email}")
            
            # Update user info if needed
            if not created:
                updated = False
                if user.email != email:
                    user.email = email
                    updated = True
                if user.first_name != first_name:
                    user.first_name = first_name
                    updated = True
                if user.last_name != last_name:
                    user.last_name = last_name
                    updated = True
                if updated:
                    user.save()
                    logger.info(f"Updated user info: {email}")
            
            return (user, decoded_token)
            
        except auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token')
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('Expired Firebase token')
        except auth.RevokedIdTokenError:
            raise exceptions.AuthenticationFailed('Revoked Firebase token')
        except Exception as e:
            logger.error(f"Firebase authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')

    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the WWW-Authenticate
        header in a 401 Unauthenticated response.
        """
        return 'Bearer realm="api"'


class FirebaseBackend(BaseBackend):
    """
    Django authentication backend for Firebase
    """
    def authenticate(self, request, firebase_uid=None, **kwargs):
        if firebase_uid is None:
            return None
            
        try:
            user = User.objects.get(firebase_uid=firebase_uid)
            return user
        except User.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None