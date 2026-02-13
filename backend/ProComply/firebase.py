# ProComply/firebase.py
import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    """Initialize Firebase Admin SDK using Application Default Credentials"""
    
    if firebase_admin._apps:
        print("ℹ️  Firebase already initialized")
        return True
    
    try:
        # Use Application Default Credentials (works on Render, Google Cloud, etc.)
        # This doesn't require a service account file
        cred = credentials.ApplicationDefault()
        
        # Get project ID from environment variable or default
        project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'pro-comply')
        
        firebase_admin.initialize_app(cred, {
            'projectId': project_id,
        })
        
        print(f"✅ Firebase initialized successfully with project: {project_id}")
        return True
        
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        print("ℹ️  Note: This may be okay if you're only using Firebase for token verification")
        return False

# Initialize Firebase
FIREBASE_INITIALIZED = initialize_firebase()