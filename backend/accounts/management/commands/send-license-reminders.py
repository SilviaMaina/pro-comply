from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.service.email_service import send_license_expiry_reminder
import logging
from accounts.models import UserProfile

logger = logging.getLogger(__name__)


class Command(Basfrom django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.service.email_service import send_license_expiry_reminder
import logging
from accounts.models import UserProfile
import time

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send license expiry reminder emails (60 and 30 days before expiry)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually sending emails',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        today = timezone.now().date()
        
        self.stdout.write(f"Starting reminder check at {timezone.now()}")
        
        # Calculate target dates
        sixty_days_from_now = today + timedelta(days=60)
        thirty_days_from_now = today + timedelta(days=30)
        
        # Find users whose license expires in 60 days
        profiles_60_days = UserProfile.objects.select_related('engineer').filter(
            license_expiry_date=sixty_days_from_now,
            engineer__is_active=True,
            engineer__email__isnull=False
        ).exclude(engineer__email='')
        
        # Find users whose license expires in 30 days
        profiles_30_days = UserProfile.objects.select_related('engineer').filter(
            license_expiry_date=thirty_days_from_now,
            engineer__is_active=True,
            engineer__email__isnull=False
        ).exclude(engineer__email='')
        
        # Send 60-day reminders
        sent_60 = 0
        failed_60 = 0
        for profile in profiles_60_days:
            if dry_run:
                self.stdout.write(f"Would send 60-day reminder to {profile.engineer.email}")
                sent_60 += 1
                continue
                
            try:
                send_license_expiry_reminder(profile, 60)
                sent_60 += 1
                time.sleep(0.1)  # Small delay to respect rate limits
            except Exception as e:
                failed_60 += 1
                logger.error(
                    f"Failed to send 60-day reminder to {profile.engineer.email}: {str(e)}"
                )
        
        # Send 30-day reminders
        sent_30 = 0
        failed_30 = 0
        for profile in profiles_30_days:
            if dry_run:
                self.stdout.write(f"Would send 30-day reminder to {profile.engineer.email}")
                sent_30 += 1
                continue
                
            try:
                send_license_expiry_reminder(profile, 30)
                sent_30 += 1
                time.sleep(0.1)  # Small delay to respect rate limits
            except Exception as e:
                failed_30 += 1
                logger.error(
                    f"Failed to send 30-day reminder to {profile.engineer.email}: {str(e)}"
                )
        
        summary = (
            f'60-day reminders: {sent_60} sent, {failed_60} failed\n'
            f'30-day reminders: {sent_30} sent, {failed_30} failed\n'
            f'Completed at {timezone.now()}'
        )
        
        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUN - No emails sent\n{summary}'))
        else:
            self.stdout.write(self.style.SUCCESS(summary))eCommand):
    help = 'Send license expiry reminder emails (60 and 30 days before expiry)'

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Calculate target dates
        sixty_days_from_now = today + timedelta(days=60)
        thirty_days_from_now = today + timedelta(days=30)
        
        # Find users whose license expires in 60 days
        profiles_60_days = UserProfile.objects.filter(
            license_expiry_date=sixty_days_from_now,
            engineer__is_active=True,
            engineer__email__isnull=False
        ).exclude(engineer__email='')
        

        # Find users whose license expires in 30 days
        profiles_30_days = UserProfile.objects.filter(
            license_expiry_date=thirty_days_from_now,
            engineer__is_active=True,
            engineer__email__isnull=False
        ).exclude(engineer__email='')
        
        # Send 60-day reminders
        sent_60 = 0
        for profile in profiles_60_days:
            try:
                send_license_expiry_reminder(profile, 60)
                sent_60 += 1
            except Exception as e:
                logger.error(f"Failed to send 60-day reminder to {profile.engineer.email}: {str(e)}")
        
        # Send 30-day reminders
        sent_30 = 0
        for profile in profiles_30_days:
            try:
                send_license_expiry_reminder(profile, 30)
                sent_30 += 1
            except Exception as e:
                logger.error(f"Failed to send 30-day reminder to {profile.engineer.email}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully sent {sent_60} 60-day reminders and {sent_30} 30-day reminders'
            )
        )