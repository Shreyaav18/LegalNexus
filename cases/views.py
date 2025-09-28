# views.py - Case Prioritization and Management API

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, F, Count, Avg
from django.utils import timezone
from django.contrib.auth import authenticate, login
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.authtoken.models import Token
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from datetime import timedelta

from .models import (
    User, LawyerProfile, Case, CaseDocument, 
    CaseActivity, CaseNote, LegalNews, Notification
)
from .serializers import (
    UserSerializer, LawyerProfileSerializer, CaseSerializer,
    CaseDocumentSerializer, CaseActivitySerializer, CaseNoteSerializer,
    NotificationSerializer, CasePrioritySerializer
)


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'user_type': user.user_type
                })
            else:
                return Response({'error': 'Invalid credentials'}, 
                              status=status.HTTP_401_UNAUTHORIZED)
        return Response({'error': 'Username and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        if request.user.is_authenticated:
            request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})

class CaseViewSet(viewsets.ModelViewSet):
    """Case management with advanced prioritization"""
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['case_type', 'status', 'priority_level', 'assigned_lawyer']
    search_fields = ['title', 'description', 'case_number']
    ordering_fields = ['priority_level', 'urgency_score', 'deadline', 'created_at']
    ordering = ['priority_level', '-urgency_score']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'lawyer':
            return Case.objects.filter(assigned_lawyer=user)
        elif user.user_type == 'client':
            return Case.objects.filter(client=user)
        else:  # admin
            return Case.objects.all()
    
    def perform_create(self, serializer):
        case = serializer.save(client=self.request.user)
        # Generate unique case number
        case.case_number = f"LN{timezone.now().year}{case.pk:06d}"
        case.save()
        
        # Calculate initial priority
        case.calculate_priority_score()
        
        # Create activity log
        CaseActivity.objects.create(
            case=case,
            activity_type='status_change',
            description=f'Case created with status: {case.status}',
            performed_by=self.request.user
        )
        
        # Send real-time notification
        self.send_realtime_update('case_created', case)
    
    @action(detail=True, methods=['post'])
    def assign_lawyer(self, request, pk=None):
        case = self.get_object()
        lawyer_id = request.data.get('lawyer_id')
        
        try:
            lawyer = User.objects.get(id=lawyer_id, user_type='lawyer')
            case.assigned_lawyer = lawyer
            case.save()
            
            # Log activity
            CaseActivity.objects.create(
                case=case,
                activity_type='assignment',
                description=f'Case assigned to {lawyer.get_full_name()}',
                performed_by=request.user
            )
            
            # Create notification
            Notification.objects.create(
                recipient=lawyer,
                notification_type='case_update',
                title='New Case Assignment',
                message=f'You have been assigned to case #{case.case_number}',
                related_case=case
            )
            
            self.send_realtime_update('case_assigned', case)
            return Response({'message': 'Lawyer assigned successfully'})
            
        except User.DoesNotExist:
            return Response({'error': 'Lawyer not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        case = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Case.STATUS_CHOICES):
            old_status = case.status
            case.status = new_status
            case.last_activity = timezone.now()
            case.save()
            
            # Recalculate priority based on new status
            case.calculate_priority_score()
            
            # Log activity
            CaseActivity.objects.create(
                case=case,
                activity_type='status_change',
                description=f'Status changed from {old_status} to {new_status}',
                performed_by=request.user
            )
            
            # Notify relevant users
            if case.assigned_lawyer and case.assigned_lawyer != request.user:
                Notification.objects.create(
                    recipient=case.assigned_lawyer,
                    notification_type='case_update',
                    title='Case Status Update',
                    message=f'Case #{case.case_number} status changed to {new_status}',
                    related_case=case
                )
            
            if case.client != request.user:
                Notification.objects.create(
                    recipient=case.client,
                    notification_type='case_update',
                    title='Case Status Update',
                    message=f'Your case #{case.case_number} status changed to {new_status}',
                    related_case=case
                )
            
            self.send_realtime_update('status_updated', case)
            return Response(CaseSerializer(case).data)
        
        return Response({'error': 'Invalid status'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_priority(self, request, pk=None):
        case = self.get_object()
        new_priority = request.data.get('priority_level')
        client_importance = request.data.get('client_importance')
        
        if new_priority and int(new_priority) in range(1, 6):
            case.priority_level = new_priority
            
        if client_importance and int(client_importance) in range(1, 6):
            case.client_importance = client_importance
            
        case.save()
        case.calculate_priority_score()
        
        # Log activity
        CaseActivity.objects.create(
            case=case,
            activity_type='priority_changed',
            description=f'Priority updated to level {case.priority_level}',
            performed_by=request.user
        )
        
        self.send_realtime_update('priority_updated', case)
        return Response(CaseSerializer(case).data)
    
    @action(detail=False, methods=['get'])
    def prioritized_cases(self, request):
        """Get cases ordered by priority with detailed scoring"""
        cases = self.get_queryset()
        
        # Recalculate priorities for all cases
        for case in cases:
            case.calculate_priority_score()
        
        # Get prioritized list
        prioritized = cases.order_by('priority_level', '-urgency_score', 'deadline')
        serializer = CasePrioritySerializer(prioritized, many=True)
        
        return Response({
            'cases': serializer.data,
            'total_cases': cases.count(),
            'high_priority_count': cases.filter(priority_level__lte=2).count(),
            'overdue_count': cases.filter(deadline__lt=timezone.now()).count()
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        cases = self.get_queryset()
        
        stats = {
            'total_cases': cases.count(),
            'cases_by_status': {
                status[0]: cases.filter(status=status[0]).count() 
                for status in Case.STATUS_CHOICES
            },
            'cases_by_priority': {
                f'priority_{level}': cases.filter(priority_level=level).count()
                for level in range(1, 6)
            },
            'overdue_cases': cases.filter(deadline__lt=timezone.now()).count(),
            'due_this_week': cases.filter(
                deadline__gte=timezone.now(),
                deadline__lte=timezone.now() + timedelta(days=7)
            ).count(),
            'recent_activity': cases.filter(
                last_activity__gte=timezone.now() - timedelta(days=7)
            ).count()
        }
        
        # Lawyer-specific stats
        if request.user.user_type == 'lawyer':
            stats.update({
                'assigned_cases': cases.filter(assigned_lawyer=request.user).count(),
                'avg_case_duration': self.calculate_avg_duration(),
                'completion_rate': self.calculate_completion_rate()
            })
        
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def bulk_prioritize(self, request):
        """Bulk update priorities for multiple cases"""
        case_ids = request.data.get('case_ids', [])
        priority_level = request.data.get('priority_level')
        
        if not case_ids or not priority_level:
            return Response({'error': 'case_ids and priority_level required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        cases = self.get_queryset().filter(id__in=case_ids)
        updated_count = 0
        
        for case in cases:
            case.priority_level = priority_level
            case.save()
            case.calculate_priority_score()
            
            # Log activity
            CaseActivity.objects.create(
                case=case,
                activity_type='priority_changed',
                description=f'Bulk priority update to level {priority_level}',
                performed_by=request.user
            )
            updated_count += 1
        
        return Response({
            'message': f'Updated {updated_count} cases',
            'updated_cases': updated_count
        })
    
    def send_realtime_update(self, update_type, case):
        """Send real-time updates via WebSocket"""
        channel_layer = get_channel_layer()
        
        # Send to case-specific channel
        async_to_sync(channel_layer.group_send)(
            f"case_{case.id}",
            {
                'type': 'case_update',
                'update_type': update_type,
                'case_data': CaseSerializer(case).data
            }
        )
        
        # Send to user-specific channels
        users_to_notify = [case.client]
        if case.assigned_lawyer:
            users_to_notify.append(case.assigned_lawyer)
        
        for user in users_to_notify:
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    'type': 'case_update',
                    'update_type': update_type,
                    'case_data': CaseSerializer(case).data
                }
            )
    
    def calculate_avg_duration(self):
        """Calculate average case duration for lawyer"""
        closed_cases = self.get_queryset().filter(
            status='closed',
            assigned_lawyer=self.request.user
        )
        
        durations = []
        for case in closed_cases:
            if case.created_at:
                duration = (timezone.now() - case.created_at).days
                durations.append(duration)
        
        return sum(durations) / len(durations) if durations else 0
    
    def calculate_completion_rate(self):
        """Calculate case completion rate for lawyer"""
        total_cases = self.get_queryset().filter(assigned_lawyer=self.request.user).count()
        closed_cases = self.get_queryset().filter(
            assigned_lawyer=self.request.user,
            status='closed'
        ).count()
        
        return (closed_cases / total_cases * 100) if total_cases > 0 else 0

class CaseDocumentViewSet(viewsets.ModelViewSet):
    """Document management for cases"""
    serializer_class = CaseDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'lawyer':
            return CaseDocument.objects.filter(case__assigned_lawyer=user)
        elif user.user_type == 'client':
            return CaseDocument.objects.filter(case__client=user)
        else:
            return CaseDocument.objects.all()
    
    def perform_create(self, serializer):
        document = serializer.save(uploaded_by=self.request.user)
        
        # Log activity
        CaseActivity.objects.create(
            case=document.case,
            activity_type='document_upload',
            description=f'Document uploaded: {document.title}',
            performed_by=self.request.user
        )
        
        # Notify relevant users
        users_to_notify = [document.case.client]
        if document.case.assigned_lawyer and document.case.assigned_lawyer != self.request.user:
            users_to_notify.append(document.case.assigned_lawyer)
        
        for user in users_to_notify:
            if user != self.request.user:
                Notification.objects.create(
                    recipient=user,
                    notification_type='document_shared',
                    title='New Document Added',
                    message=f'Document "{document.title}" added to case #{document.case.case_number}',
                    related_case=document.case
                )

class CaseActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """Case activity tracking"""
    serializer_class = CaseActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        queryset = CaseActivity.objects.all()
        
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter based on user permissions
        user = self.request.user
        if user.user_type == 'lawyer':
            queryset = queryset.filter(case__assigned_lawyer=user)
        elif user.user_type == 'client':
            queryset = queryset.filter(case__client=user)
        
        return queryset.order_by('-timestamp')

class NotificationViewSet(viewsets.ModelViewSet):
    """User notifications management"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

class LawyerProfileViewSet(viewsets.ModelViewSet):
    """Lawyer profile management"""
    serializer_class = LawyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LawyerProfile.objects.all()
    
    @action(detail=False, methods=['get'])
    def available_lawyers(self, request):
        """Get available lawyers for case assignment"""
        specialization = request.query_params.get('specialization')
        queryset = LawyerProfile.objects.filter(availability_status='available')
        
        if specialization:
            queryset = queryset.filter(specializations__contains=[specialization])
        
        serializer = LawyerProfileSerializer(queryset, many=True)
        return Response(serializer.data)

"""
    class LegalNewsViewSet(viewsets.ReadOnlyModelViewSet):
        Legal news and updates
        serializer_class = LegalNewsSerializer
        permission_classes = [permissions.IsAuthenticated]
        queryset = LegalNews.objects.all()
        filter_backends = [SearchFilter, OrderingFilter]
        search_fields = ['title', 'content', 'category']
        ordering = ['-published_date']
        
        @action(detail=False, methods=['get'])
        def featured_news(self, request):
            Get featured news items
            featured = self.queryset.filter(is_featured=True)[:5]
            serializer = LegalNewsSerializer(featured, many=True)
            return Response(serializer.data)
"""