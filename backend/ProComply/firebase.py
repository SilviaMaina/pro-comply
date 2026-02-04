# ProComply/firebase.py
import firebase_admin
from firebase_admin import credentials
import os
import sys
from pathlib import Path

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    
    if firebase_admin._apps:
        print("ℹ️  Firebase already initialized")
        return True
    
    # Debug: Show where we're looking
    current_file = Path(__file__).resolve()
    print(f"📁 Current file: {current_file}")
    print(f"📁 Current file parent: {current_file.parent}")
    print(f"📁 Project root (parent.parent): {current_file.parent.parent}")
    
    # Try multiple possible locations
    possible_paths = [
        # Method 1: Two levels up from this file
        current_file.parent.parent / 'firebase-service-account.json',
        # Method 2: One level up (in case structure is different)
        current_file.parent / 'firebase-service-account.json',
        # Method 3: In the current working directory
        Path.cwd() / 'firebase-service-account.json',
        # Method 4: Absolute path based on your ls output
        Path(r'C:\Users\Sylvia\software-dev\pro-comply\backend\firebase-service-account.json'),
    ]
    
    print("\n🔍 Searching for firebase-service-account.json in:")
    for i, path in enumerate(possible_paths, 1):
        exists = path.exists()
        print(f"   {i}. {path}")
        print(f"      Exists: {exists}")
        
        if exists:
            try:
                print(f"   ✅ Found! Attempting to initialize...")
                cred = credentials.Certificate(str(path))
                firebase_admin.initialize_app(cred)
                print(f"   ✅ Firebase initialized successfully from: {path}")
                return True
            except Exception as e:
                print(f"   ❌ Failed to initialize: {e}")
    
    # Check environment variable
    env_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH')
    if env_path:
        print(f"\n🔍 Checking environment variable: {env_path}")
        if os.path.exists(env_path):
            try:
                cred = credentials.Certificate(env_path)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase initialized from environment variable")
                return True
            except Exception as e:
                print(f"❌ Failed: {e}")
    
    # Show current directory contents
    print(f"\n📂 Files in current working directory ({Path.cwd()}):")
    try:
        for item in sorted(Path.cwd().iterdir())[:20]:  # Show first 20 items
            print(f"   - {item.name}")
    except Exception as e:
        print(f"   Error listing: {e}")
    
    print("\n" + "="*70)
    print("⚠️  WARNING: Firebase not initialized!")
    print("="*70)
    
    return False

# Initialize
FIREBASE_INITIALIZED = initialize_firebase()