# ProComply/firebase.py
import firebase_admin
from firebase_admin import credentials
import os
import json


def initialize_firebase():
    """
    Initialize Firebase Admin SDK using Service Account JSON
    (Render / Vercel safe)
    """

    if firebase_admin._apps:
        print("ℹ️ Firebase already initialized")
        return True

    try:
        service_account_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")

        if not service_account_json:
            raise RuntimeError(
                "Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable"
            )

        cred = credentials.Certificate(json.loads(service_account_json))

        firebase_admin.initialize_app(cred)

        print("✅ Firebase Admin initialized successfully")
        return True

    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        return False


FIREBASE_INITIALIZED = initialize_firebase()
