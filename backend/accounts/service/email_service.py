import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_brevo_api_instance():
    """Initialize and return Brevo API instance"""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


def send_welcome_email(user):
    """Send a welcome email to newly registered users using Brevo"""
    api_instance = get_brevo_api_instance()
    
    subject = 'Welcome to Engineer Registration System'
    
    # HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: #2c3e50; margin-top: 0;">Welcome, {user.first_name or 'Engineer'}!</h2>
                <p>Thank you for registering with the Engineer Registration System.</p>
                <p>Your account has been successfully created with email: <strong>{user.email}</strong></p>
                <p>You can now log in and complete your profile to access all features.</p>
                <div style="margin: 30px 0; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 3px;">
                    <p style="margin: 0;"><strong>Next Steps:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Complete your profile information</li>
                        <li>Upload required documents</li>
                        <li>Submit for verification</li>
                    </ul>
                </div>
                <p style="margin-top: 30px;">Best regards,<br><strong>The Engineering Board Team</strong></p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_content = f"""
    Welcome, {user.first_name or 'Engineer'}!
    
    Thank you for registering with the Engineer Registration System.
    
    Your account has been successfully created with email: {user.email}
    
    You can now log in and complete your profile to access all features.
    
    Next Steps:
    - Complete your profile information
    - Upload required documents
    - Submit for verification
    
    Best regards,
    The Engineering Board Team
    
    ---
    This is an automated message. Please do not reply to this email.
    """
    
    # Configure email
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": user.email, "name": f"{user.first_name} {user.last_name}".strip() or user.email}],
        sender={"email": settings.BREVO_SENDER_EMAIL, "name": settings.BREVO_SENDER_NAME},
        subject=subject,
        html_content=html_content,
        text_content=text_content,
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Welcome email sent successfully to {user.email}. Message ID: {api_response.message_id}")
        return True
    except ApiException as e:
        logger.error(f"Failed to send welcome email via Brevo to {user.email}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error sending welcome email to {user.email}: {str(e)}")
        raise


def send_license_expiry_reminder(user, days_until_expiry):
    """Send license expiry reminder email using Brevo"""
    api_instance = get_brevo_api_instance()
    
    subject = f'License Expiry Reminder - {days_until_expiry} Days Remaining'
    
    # Determine urgency styling
    urgency_color = "#e74c3c" if days_until_expiry == 30 else "#f39c12"
    urgency_bg = "#ffebee" if days_until_expiry == 30 else "#fff3e0"
    
    # HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: {urgency_color}; margin-top: 0;">⚠️ License Expiry Reminder</h2>
                <p>Dear {user.first_name or 'Engineer'},</p>
                
                <div style="background-color: {urgency_bg}; padding: 15px; border-radius: 5px; border-left: 4px solid {urgency_color}; margin: 20px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: {urgency_color};">
                        Your engineering license will expire in {days_until_expiry} days
                    </p>
                </div>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2c3e50;">License Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Registration Number:</td>
                            <td style="padding: 8px 0;">{user.ebk_registration_number or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Expiry Date:</td>
                            <td style="padding: 8px 0;">{user.license_expiry_date.strftime('%B %d, %Y') if user.license_expiry_date else 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <p><strong>Action Required:</strong> Please renew your license before it expires to avoid any service interruptions.</p>
                
                <p style="margin-top: 30px;">Best regards,<br><strong>The Engineering Board Team</strong></p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
                This is an automated reminder. Please do not reply to this email.
            </p>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_content = f"""
    License Expiry Reminder
    
    Dear {user.first_name or 'Engineer'},
    
    ⚠️ Your engineering license will expire in {days_until_expiry} days.
    
    License Details:
    - Registration Number: {user.ebk_registration_number or 'N/A'}
    - Expiry Date: {user.license_expiry_date.strftime('%B %d, %Y') if user.license_expiry_date else 'N/A'}
    
    Action Required: Please renew your license before it expires to avoid any service interruptions.
    
    Best regards,
    The Engineering Board Team
    
    ---
    This is an automated reminder. Please do not reply to this email.
    """
    
    # Configure email
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": user.email, "name": f"{user.first_name} {user.last_name}".strip() or user.email}],
        sender={"email": settings.BREVO_SENDER_EMAIL, "name": settings.BREVO_SENDER_NAME},
        subject=subject,
        html_content=html_content,
        text_content=text_content,
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"License expiry reminder ({days_until_expiry} days) sent to {user.email}. Message ID: {api_response.message_id}")
        return True
    except ApiException as e:
        logger.error(f"Failed to send expiry reminder via Brevo to {user.email}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error sending expiry reminder to {user.email}: {str(e)}")
        raise


def send_custom_email(to_email, to_name, subject, html_content, text_content=None):
    """
    Generic function to send custom emails via Brevo
    
    Args:
        to_email: Recipient email address
        to_name: Recipient name
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text fallback (optional)
    """
    api_instance = get_brevo_api_instance()
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email, "name": to_name}],
        sender={"email": settings.BREVO_SENDER_EMAIL, "name": settings.BREVO_SENDER_NAME},
        subject=subject,
        html_content=html_content,
        text_content=text_content,
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Custom email sent successfully to {to_email}. Message ID: {api_response.message_id}")
        return api_response
    except ApiException as e:
        logger.error(f"Failed to send custom email via Brevo to {to_email}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error sending custom email to {to_email}: {str(e)}")
        raise