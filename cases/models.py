# models.py for Legal Nexus
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    """Extended User model for both clients and lawyers"""
    USER_TYPES = [
        ('client', 'Client'),
        ('lawyer', 'Lawyer'),
        ('admin', 'Admin')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='client')
    phone = models.CharField(max_length=15, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.user_type})"

class LawyerProfile(models.Model):
    """Additional profile information for lawyers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    license_number = models.CharField(max_length=50, unique=True)
    specializations = models.JSONField(default=list)  # ["Criminal", "Civil", "Corporate"]
    experience_years = models.IntegerField(validators=[MinValueValidator(0)])
    bar_association = models.CharField(max_length=100)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_status = models.CharField(
        max_length=20, 
        choices=[('available', 'Available'), ('busy', 'Busy'), ('offline', 'Offline')],
        default='available'
    )
    rating = models.FloatField(default=0.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_cases = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Lawyer: {self.user.get_full_name()}"

class Case(models.Model):
    """Main case model with priority system"""
    CASE_TYPES = [
        ('criminal', 'Criminal'),
        ('civil', 'Civil'),
        ('family', 'Family'),
        ('corporate', 'Corporate'),
        ('immigration', 'Immigration'),
        ('personal_injury', 'Personal Injury'),
        ('property', 'Property'),
        ('other', 'Other')
    ]
    
    PRIORITY_LEVELS = [
        (1, 'Critical - Immediate Action Required'),
        (2, 'High - Within 24 hours'),
        (3, 'Medium - Within 3 days'),
        (4, 'Low - Within a week'),
        (5, 'Routine - No rush')
    ]
    
    STATUS_CHOICES = [
        ('filed', 'Filed'),
        ('investigation', 'Investigation'),
        ('hearing', 'Hearing'),
        ('trial', 'Trial'),
        ('closed', 'Closed'),
        ('on_hold', 'On Hold')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case_number = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    case_type = models.CharField(max_length=20, choices=CASE_TYPES)
    
    # Relationships
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_cases')
    assigned_lawyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='lawyer_cases')
    
    # Priority and Status
    priority_level = models.IntegerField(choices=PRIORITY_LEVELS, default=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='filed')
    
    # Important Dates
    filing_date = models.DateTimeField(default=timezone.now)
    deadline = models.DateTimeField(null=True, blank=True)
    next_hearing = models.DateTimeField(null=True, blank=True)
    
    # Financial
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Priority Calculation Fields
    urgency_score = models.FloatField(default=0.0)  # Calculated field
    client_importance = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['priority_level', '-urgency_score', 'deadline']
    
    def __str__(self):
        return f"Case #{self.case_number}: {self.title}"
    
    def calculate_priority_score(self):
        """Calculate dynamic priority score based on multiple factors"""
        score = 0
        
        # Base priority weight
        priority_weights = {1: 100, 2: 80, 3: 60, 4: 40, 5: 20}
        score += priority_weights.get(self.priority_level, 60)
        
        # Deadline urgency
        if self.deadline:
            days_until_deadline = (self.deadline - timezone.now()).days
            if days_until_deadline <= 0:
                score += 50  # Overdue
            elif days_until_deadline <= 1:
                score += 40  # Due today/tomorrow
            elif days_until_deadline <= 7:
                score += 30  # Due this week
            elif days_until_deadline <= 30:
                score += 20  # Due this month
        
        # Client importance factor
        score += self.client_importance * 5
        
        # Case type urgency
        urgent_case_types = ['criminal', 'personal_injury']
        if self.case_type in urgent_case_types:
            score += 15
        
        # Last activity (cases not updated recently get lower priority)
        days_since_activity = (timezone.now() - self.last_activity).days
        if days_since_activity > 30:
            score -= 10
        elif days_since_activity > 7:
            score -= 5
        
        self.urgency_score = score
        self.save(update_fields=['urgency_score'])
        return score

class CaseDocument(models.Model):
    """Documents related to cases"""
    DOCUMENT_TYPES = [
        ('contract', 'Contract'),
        ('evidence', 'Evidence'),
        ('court_filing', 'Court Filing'),
        ('correspondence', 'Correspondence'),
        ('legal_brief', 'Legal Brief'),
        ('other', 'Other')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='case_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    is_confidential = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - Case #{self.case.case_number}"

class CaseActivity(models.Model):
    """Track all activities/updates on cases for real-time features"""
    ACTIVITY_TYPES = [
        ('status_change', 'Status Change'),
        ('document_upload', 'Document Upload'),
        ('assignment', 'Lawyer Assignment'),
        ('hearing_scheduled', 'Hearing Scheduled'),
        ('payment_received', 'Payment Received'),
        ('note_added', 'Note Added'),
        ('priority_changed', 'Priority Changed')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)  # Store additional activity data
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.activity_type} - Case #{self.case.case_number}"

class CaseNote(models.Model):
    """Internal notes for cases"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_private = models.BooleanField(default=False)  # Private to lawyer only
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note by {self.author.username} - Case #{self.case.case_number}"

class LegalNews(models.Model):
    """Legal news and updates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50)
    source = models.CharField(max_length=100)
    published_date = models.DateTimeField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-published_date']
    
    def __str__(self):
        return self.title

class Notification(models.Model):
    """Real-time notifications for users"""
    NOTIFICATION_TYPES = [
        ('case_update', 'Case Update'),
        ('new_message', 'New Message'),
        ('hearing_reminder', 'Hearing Reminder'),
        ('document_shared', 'Document Shared'),
        ('payment_due', 'Payment Due'),
        ('system', 'System Notification')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"