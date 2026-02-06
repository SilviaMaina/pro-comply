from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from users.service.email_service import send_license_expiry_reminder
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class Command(BaseCommand):
    help = 'Send license expiry reminder emails (60 and 30 days before expiry)'

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Calculate target dates
        sixty_days_from_now = today + timedelta(days=60)
        thirty_days_from_now = today + timedelta(days=30)
        
        # Find users whose license expires in 60 days
        users_60_days = User.objects.filter(
            license_expiry_date=sixty_days_from_now,
            is_active=True,
            email__isnull=False
        ).exclude(email='')
        
        # Find users whose license expires in 30 days
        users_30_days = User.objects.filter(
            license_expiry_date=thirty_days_from_now,
            is_active=True,
            email__isnull=False
        ).exclude(email='')
        
        # Send 60-day reminders
        sent_60 = 0
        for user in users_60_days:
            try:
                send_license_expiry_reminder(user, 60)
                sent_60 += 1
            except Exception as e:
                logger.error(f"Failed to send 60-day reminder to {user.email}: {str(e)}")
        
        # Send 30-day reminders
        sent_30 = 0
        for user in users_30_days:
            try:
                send_license_expiry_reminder(user, 30)
                sent_30 += 1
            except Exception as e:
                logger.error(f"Failed to send 30-day reminder to {user.email}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully sent {sent_60} 60-day reminders and {sent_30} 30-day reminders'
            )
        )