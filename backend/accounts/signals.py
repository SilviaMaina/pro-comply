from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Engineer, UserProfile

@receiver(post_save, sender=Engineer)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(engineer=instance)

@receiver(post_save, sender=Engineer)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()        
         