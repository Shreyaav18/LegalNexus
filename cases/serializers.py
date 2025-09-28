# serializers.py - API Serializers for Legal Nexus

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import (
    User, LawyerProfile, Case, CaseDocument, 
    CaseActivity, CaseNote, LegalNews, Notification
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'user_type', 'phone', 'profile_image', 'is_verified',
            'password', 'confirm_password', 'full_name', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create lawyer profile if user is a lawyer
        if user.user_type == 'lawyer':
            LawyerProfile.objects.create(
                user=user,
                license_number=f"LIC{user.id:06d}",  # Temporary license number
                specializations=[],
                experience_years=0,
                bar_association="",
            )
        
        return user

class LawyerProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    specializations_display = serializers.SerializerMethodField()
    
    class Meta:
        model = LawyerProfile
        fields = [
            'user', 'user_details', 'license_number', 'specializations',
            'specializations_display', 'experience_years', 'bar_association',
            'hourly_rate', 'availability_status', 'rating', 'total_cases'
        ]
        read_only_fields = ['user', 'rating', 'total_cases']
    
    def get_specializations_display(self, obj):
        return ', '.join(obj.specializations) if obj.specializations else 'General Practice'

class CaseDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_size = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseDocument
        fields = [
            'id', 'case', 'title', 'document_type', 'file', 'file_url',
            'file_size', 'uploaded_by', 'uploaded_by_name', 'description',
            'is_confidential', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']
    
    def get_file_size(self, obj):
        try:
            return obj.file.size if obj.file else 0
        except:
            return 0
    
    def get_file_url(self, obj):
        try:
            return obj.file.url if obj.file else None
        except:
            return None

class CaseActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseActivity
        fields = [
            'id', 'case', 'activity_type', 'description', 'performed_by',
            'performed_by_name', 'timestamp', 'time_since', 'metadata'
        ]
        read_only_fields = ['id', 'performed_by', 'timestamp']
    
    def get_time_since(self, obj):
        now = timezone.now()
        diff = now - obj.timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"

class CaseNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = CaseNote
        fields = [
            'id', 'case', 'author', 'author_name', 'content',
            'is_private', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

class CaseSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    assigned_lawyer_name = serializers.CharField(source='assigned_lawyer.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_type_display = serializers.CharField(source='get_case_type_display', read_only=True)
    
    # Related data counts
    document_count = serializers.SerializerMethodField()
    activity_count = serializers.SerializerMethodField()
    note_count = serializers.SerializerMethodField()
    
    # Time-based fields
    days_since_filing = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    # Recent activity
    recent_activities = CaseActivitySerializer(source='activities', many=True, read_only=True)
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'description', 'case_type', 'case_type_display',
            'client', 'client_name', 'assigned_lawyer', 'assigned_lawyer_name',
            'priority_level', 'priority_display', 'status', 'status_display',
            'filing_date', 'deadline', 'next_hearing', 'estimated_cost', 'amount_paid',
            'urgency_score', 'client_importance', 'created_at', 'updated_at', 'last_activity',
            'document_count', 'activity_count', 'note_count', 'days_since_filing',
            'days_until_deadline', 'is_overdue', 'recent_activities'
        ]
        read_only_fields = [
            'id', 'case_number', 'urgency_score', 'created_at', 
            'updated_at', 'last_activity'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_activity_count(self, obj):
        return obj.activities.count()
    
    def get_note_count(self, obj):
        return obj.notes.count()
    
    def get_days_since_filing(self, obj):
        return (timezone.now() - obj.filing_date).days
    
    def get_days_until_deadline(self, obj):
        if obj.deadline:
            return (obj.deadline - timezone.now()).days
        return None
    
    def get_is_overdue(self, obj):
        if obj.deadline:
            return obj.deadline < timezone.now()
        return False
    
    def to_representation(self, instance):
        """Customize representation based on user permissions"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and hasattr(request, 'user'):
            user = request.user
            
            # Limit recent activities to last 5
            if 'recent_activities' in data:
                data['recent_activities'] = data['recent_activities'][:5]
            
            # Hide confidential information from clients
            if user.user_type == 'client' and user != instance.client:
                # Clients can only see their own cases
                sensitive_fields = ['estimated_cost', 'amount_paid', 'urgency_score']
                for field in sensitive_fields:
                    data.pop(field, None)
        
        return data

class CasePrioritySerializer(serializers.ModelSerializer):
    """Specialized serializer for priority-focused case display"""
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    assigned_lawyer_name = serializers.CharField(source='assigned_lawyer.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_level_display', read_only=True)
    
    # Priority-specific fields
    priority_factors = serializers.SerializerMethodField()
    urgency_level = serializers.SerializerMethodField()
    action_required = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'case_type', 'client_name',
            'assigned_lawyer_name', 'priority_level', 'priority_display',
            'urgency_score', 'status', 'deadline', 'last_activity',
            'priority_factors', 'urgency_level', 'action_required'
        ]
    
    def get_priority_factors(self, obj):
        """Return factors contributing to priority score"""
        factors = []
        
        if obj.deadline:
            days_until = (obj.deadline - timezone.now()).days
            if days_until <= 0:
                factors.append("Overdue")
            elif days_until <= 1:
                factors.append("Due today/tomorrow")
            elif days_until <= 7:
                factors.append("Due this week")
        
        if obj.priority_level <= 2:
            factors.append("High priority level")
        
        if obj.client_importance >= 4:
            factors.append("Important client")
        
        if obj.case_type in ['criminal', 'personal_injury']:
            factors.append("Urgent case type")
        
        days_since_activity = (timezone.now() - obj.last_activity).days
        if days_since_activity > 30:
            factors.append("No recent activity")
        
        return factors
    
    def get_urgency_level(self, obj):
        """Return urgency level based on score"""
        if obj.urgency_score >= 90:
            return "Critical"
        elif obj.urgency_score >= 70:
            return "High"
        elif obj.urgency_score >= 50:
            return "Medium"
        elif obj.urgency_score >= 30:
            return "Low"
        else:
            return "Routine"
    
    def get_action_required(self, obj):
        """Suggest next action based on case state"""
        if obj.deadline and obj.deadline <= timezone.now():
            return "Immediate attention - deadline passed"
        elif obj.deadline and (obj.deadline - timezone.now()).days <= 1:
            return "Urgent - deadline within 24 hours"
        elif obj.status == 'filed' and not obj.assigned_lawyer:
            return "Assign lawyer"
        elif (timezone.now() - obj.last_activity).days > 7:
            return "Update required - no recent activity"
        elif obj.status == 'investigation':
            return "Continue investigation"
        elif obj.status == 'hearing' and not obj.next_hearing:
            return "Schedule hearing date"
        else:
            return "Monitor progress"

class NotificationSerializer(serializers.ModelSerializer):
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read',
            'related_case', 'created_at', 'time_since'
        ]
        read_only_fields = ['id', 'created_at']
    
    