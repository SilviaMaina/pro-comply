import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_brevo_api_instance():
    if not settings.EMAIL_HOST_PASSWORD:
        raise RuntimeError("BREVO_SMTP_KEY is missing")

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.EMAIL_HOST_PASSWORD

    return sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )


def send_welcome_email(user):
    api_instance = get_brevo_api_instance()

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}".strip()
        }],
        sender={
            "email": settings.EMAIL_HOST_USER,
            "name": settings.EMAIL_SENDER_NAME
        },
        subject="Welcome to Engineer Registration System",
        html_content=f"""
        <h2>Welcome, {user.first_name or 'Engineer'}!</h2>
        <p>Your account has been successfully created.</p>
        """,
        text_content=f"Welcome {user.first_name or 'Engineer'}!"
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Welcome email sent to {user.email}")
        return True
    except ApiException as e:
        logger.error(f"Brevo error: {e}")
        raise


def send_license_expiry_reminder(profile, days_until_expiry):
    api_instance = get_brevo_api_instance()
    user = profile.engineer

    urgency_color = "#e74c3c" if days_until_expiry == 30 else "#f39c12"

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}".strip()
        }],
        sender={
            "email": settings.EMAIL_HOST_USER,
            "name": settings.EMAIL_SENDER_NAME
        },
        subject=f"License Expiry Reminder – {days_until_expiry} Days Remaining",
        html_content=f"""
        <h2 style="color:{urgency_color}">
            License Expiry Reminder
        </h2>
        <p>Dear {user.first_name or 'Engineer'},</p>
        <p>
            Your license will expire in <strong>{days_until_expiry} days</strong>.
        </p>
        <p>
            <strong>Registration Number:</strong>
            {user.ebk_registration_number or 'N/A'}
        </p>
        <p>
            <strong>Expiry Date:</strong>
            {profile.license_expiry_date.strftime('%B %d, %Y')}
        </p>
        """,
        text_content=f"""
        License Expiry Reminder

        Your license expires in {days_until_expiry} days.
        Expiry date: {profile.license_expiry_date}
        """
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        logger.info(
            f"{days_until_expiry}-day reminder sent to {user.email}"
        )
        return True
    except ApiException as e:
        logger.error(f"Brevo error: {e}")
        raise
