import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_brevo_api_instance():
    """
    Initialize and return Brevo API instance.
    Raises RuntimeError if API key is not configured.
    """
    if not hasattr(settings, 'EMAIL_HOST_PASSWORD') or not settings.EMAIL_HOST_PASSWORD:
        raise RuntimeError(
            "BREVO_SMTP_KEY is missing. Please ensure BREVO_SMTP_KEY is set in your .env file"
        )

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.EMAIL_HOST_PASSWORD

    return sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )


def send_welcome_email(user):
    """
    Send welcome email to newly registered user.
    
    Args:
        user: Engineer model instance
        
    Returns:
        bool: True if email sent successfully
        
    Raises:
        ValueError: If user has no email
        ApiException: If Brevo API call fails
    """
    if not user.email:
        raise ValueError(f"User {user.id} has no email address")
    
    api_instance = get_brevo_api_instance()

    user_name = f"{user.first_name} {user.last_name}".strip() or "Engineer"

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{
            "email": user.email,
            "name": user_name
        }],
        sender={
            "email": settings.EMAIL_HOST_USER,
            "name": settings.EMAIL_SENDER_NAME
        },
        subject="Welcome to Engineer Registration System",
        html_content=f"""
        <html>
            <body>
                <h2>Welcome, {user.first_name or 'Engineer'}!</h2>
                <p>Your account has been successfully created.</p>
                <p>You can now access all the features of the Engineer Registration System.</p>
            </body>
        </html>
        """,
        text_content=f"Welcome {user.first_name or 'Engineer'}! Your account has been successfully created."
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Welcome email sent to {user.email}")
        return True
    except ApiException as e:
        logger.error(f"Brevo API error sending welcome email to {user.email}: {e}")
        raise


def send_license_expiry_reminder(profile, days_until_expiry):
    """
    Send license expiry reminder email.
    
    Args:
        profile: UserProfile model instance
        days_until_expiry: Number of days until license expires (30 or 60)
        
    Returns:
        bool: True if email sent successfully
        
    Raises:
        ValueError: If user has no email or license expiry date
        ApiException: If Brevo API call fails
    """
    user = profile.engineer
    
    # Validate required fields
    if not user.email:
        raise ValueError(f"User {user.id} has no email address")
    
    if not profile.license_expiry_date:
        raise ValueError(f"Profile {profile.id} has no license expiry date")
    
    api_instance = get_brevo_api_instance()

    # Color coding based on urgency
    urgency_color = "#e74c3c" if days_until_expiry == 30 else "#f39c12"
    user_name = f"{user.first_name} {user.last_name}".strip() or "Engineer"
    expiry_date_str = profile.license_expiry_date.strftime('%B %d, %Y')

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{
            "email": user.email,
            "name": user_name
        }],
        sender={
            "email": settings.EMAIL_HOST_USER,
            "name": settings.EMAIL_SENDER_NAME
        },
        subject=f"License Expiry Reminder – {days_until_expiry} Days Remaining",
        html_content=f"""
        <html>
            <body>
                <h2 style="color:{urgency_color}">
                    License Expiry Reminder
                </h2>
                <p>Dear {user.first_name or 'Engineer'},</p>
                <p>
                    Your professional license will expire in <strong>{days_until_expiry} days</strong>.
                </p>
                <p>
                    <strong>Registration Number:</strong> {user.ebk_registration_number or 'N/A'}
                </p>
                <p>
                    <strong>Expiry Date:</strong> {expiry_date_str}
                </p>
                <p>
                    Please ensure you renew your license before the expiry date to maintain your professional standing.
                </p>
                <p>
                    Best regards,<br>
                    Pro-Comply Team
                </p>
            </body>
        </html>
        """,
        text_content=f"""
License Expiry Reminder

Dear {user.first_name or 'Engineer'},

Your license expires in {days_until_expiry} days.

Registration Number: {user.ebk_registration_number or 'N/A'}
Expiry Date: {expiry_date_str}

Please ensure you renew your license before the expiry date.

Best regards,
Pro-Comply Team
        """
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        logger.info(
            f"{days_until_expiry}-day reminder sent to {user.email} "
            f"(Expiry: {expiry_date_str})"
        )
        return True
    except ApiException as e:
        logger.error(
            f"Brevo API error sending {days_until_expiry}-day reminder "
            f"to {user.email}: {e}"
        )
        raise