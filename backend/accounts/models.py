from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import RegexValidator
from cloudinary.models import CloudinaryField

# Create your models here.
class EngineerManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
       
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
class Engineer(AbstractBaseUser, PermissionsMixin):
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    ebk_registration_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        unique=True,
        validators=[RegexValidator(
            regex=r'^EBK\/[0-9]{4}\/[0-9]{4,6}$', 
            message='EBK registration number must be alphanumeric and uppercase.'
            )]



    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)

    objects = EngineerManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    

class UserProfile(models.Model):
    engineer = models.OneToOneField(
        Engineer,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    profile_photo = CloudinaryField(
        'image',
        folder='profile_photos/',
        blank=True,
        null=True,
        transformation={
            'width': 300,
            'height': 300,
            'crop': 'fill',
            'gravity': 'face'
        }
    )
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    national_id = models.CharField(max_length=8, blank=True, null=True)
    license_expiry_date = models.DateField(blank=True, null=True)
    engineering_specialization = models.CharField(max_length=100, blank=True, null=True)
    #PDU units tracking
    pdu_units_earned = models.PositiveIntegerField(default=0)
    pdu_units_required = models.PositiveIntegerField(default=60)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.engineer.first_name} {self.engineer.last_name}"
    @property
    def pdu_units_remaining(self):
        return max(0, self.pdu_units_required - self.pdu_units_earned)
    
    @property
    def license_status(self):
        if not self.license_expiry_date:
            return "No license information"
        from datetime import date
        if self.license_expiry_date < date.today():
            return "Expired"
        elif (self.license_expiry_date - date.today()).days <= 60:
            return "Expiring Soon"
        else:
            return "Valid"

            