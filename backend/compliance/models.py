from django.db import models
from django.core.validators import MinValueValidator
from cloudinary.models import CloudinaryField
from accounts.models import Engineer

class CPDActivity(models.Model):
    ACTIVITY_TYPE_CHOICES = [
        ('EBK_ORGANIZED', 'EBK Organized Activities'),
        ('PARTICIPATION', 'Participation (Mentoring, Committees)'),
        ('PRESENTATION', 'Presentations'),
        ('KNOWLEDGE_CONTRIBUTION', 'Contributions to Knowledge'),
        ('WORK_BASED', 'Work-Based Activities'),
        ('INFORMAL', 'Informal (Self-Study, Conferences)'),
        ('ACCREDITED_PROVIDER', 'Accredited Service Provider'),
    ]
    
    STATUS_CHOICES = [
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='cpd_activities')
    
    # Activity details
    title = models.CharField(max_length=255)
    description = models.TextField()
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)
    date_completed = models.DateField()
    hours_spent = models.PositiveIntegerField(help_text="Total hours spent")

    # Supporting documents (certificates, proof)
    supporting_document = CloudinaryField(
        'document',
        folder='cpd_certificates/',
        blank=True,
        null=True,
        help_text="Upload certificate or proof of attendance"
    )

    # Auto-calculated fields
    pdu_units_awarded = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPROVED')
    rejection_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_completed']
        verbose_name = "CPD Activity"
        verbose_name_plural = "CPD Activities"

    def __str__(self):
        return f"{self.engineer.email} - {self.title}"

    def calculate_pdus(self):
        """Calculate PDUs based on EBK rules"""
        activity_type = self.activity_type
        hours = self.hours_spent

        if activity_type == 'WORK_BASED':
            # 1 PDU per 100 hours, max 10 PDUs
            return min(hours // 100, 10)
        
        elif activity_type == 'KNOWLEDGE_CONTRIBUTION':
            
            return min(hours, 10)
        
        else:
            # For most structured activities: 1 hour = 1 PDU (capped by category)
            return hours

    def validate_and_approve(self):
        """Auto-validate against EBK annual limits"""
        year = self.date_completed.year
        engineer = self.engineer

        # Step 1: Calculate raw PDUs
        raw_pdus = self.calculate_pdus()
        if raw_pdus <= 0:
            self.status = 'REJECTED'
            self.rejection_reason = "No valid PDUs calculated."
            return  


        # Step 2: Check annual limits
        MAX_PDUS_PER_CATEGORY = {
            'EBK_ORGANIZED': 10,
            'PARTICIPATION': 5,
            'PRESENTATION': 10,
            'KNOWLEDGE_CONTRIBUTION': 10,
            'WORK_BASED': 10,
            'INFORMAL': 10,
            'ACCREDITED_PROVIDER': 25,
        }
        
        category_limit = MAX_PDUS_PER_CATEGORY.get(self.activity_type, 10)
        current_category_pdus = CPDActivity.objects.filter(
            engineer=engineer,
            activity_type=self.activity_type,
            date_completed__year=year,
            status='APPROVED'
        ).aggregate(total=models.Sum('pdu_units_awarded'))['total'] or 0

        allowed_in_category = max(0, category_limit - current_category_pdus)
        pdus_after_category = min(raw_pdus, allowed_in_category)

        if pdus_after_category <= 0:
            self.status = 'REJECTED'
            self.rejection_reason = f"Exceeds annual limit for this activity type ({category_limit} PDUs)."
            return

        # Step 3: Structured vs Unstructured limits
        is_structured = self.activity_type != 'INFORMAL'
        total_structured = CPDActivity.objects.filter(
            engineer=engineer,
            date_completed__year=year,
            status='APPROVED',
            activity_type__in=[
                'EBK_ORGANIZED', 'PARTICIPATION', 'PRESENTATION',
                'KNOWLEDGE_CONTRIBUTION', 'WORK_BASED', 'ACCREDITED_PROVIDER'
            ]
        ).aggregate(total=models.Sum('pdu_units_awarded'))['total'] or 0

        total_unstructured = CPDActivity.objects.filter(
            engineer=engineer,
            date_completed__year=year,
            status='APPROVED',
            activity_type='INFORMAL'
        ).aggregate(total=models.Sum('pdu_units_awarded'))['total'] or 0

        # EBK: Max 40 structured + 10 unstructured = 50 total
        if is_structured:
            final_pdus = min(pdus_after_category, 40 - total_structured)
        else:
            final_pdus = min(pdus_after_category, 10 - total_unstructured)

        if final_pdus <= 0:
            self.status = 'REJECTED'
            self.rejection_reason = "Exceeds annual CPD limit (max 50 PDUs: 40 structured + 10 unstructured)."
            return

        # Approve!
        self.pdu_units_awarded = final_pdus
        self.status = 'APPROVED'
        self.rejection_reason = None

    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.validate_and_approve()
        super().save(*args, **kwargs)
                  




