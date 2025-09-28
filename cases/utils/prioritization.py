# utils/prioritization.py - Case Prioritization System

from django.utils import timezone
from django.db.models import Q, F, Count, Avg, Case as DBCase, When
from datetime import timedelta, datetime
import logging

logger = logging.getLogger(__name__)

class CasePriorityCalculator:
    """Advanced case prioritization system"""
    
    # Priority weights for different factors
    PRIORITY_WEIGHTS = {
        'deadline_urgency': 40,
        'case_priority_level': 30,
        'client_importance': 15,
        'case_type_urgency': 10,
        'activity_recency': 5
    }
    
    URGENT_CASE_TYPES = [
        'criminal', 'personal_injury', 'immigration'
    ]
    
    def __init__(self):
        self.current_time = timezone.now()
    
    def calculate_case_priority(self, case):
        """
        Calculate comprehensive priority score for a case
        Returns score between 0-100 (higher = more urgent)
        """
        score = 0
        factors = {}
        
        # 1. Deadline Urgency (40% weight)
        deadline_score = self._calculate_deadline_score(case)
        score += deadline_score * (self.PRIORITY_WEIGHTS['deadline_urgency'] / 100)
        factors['deadline_urgency'] = deadline_score
        
        # 2. Case Priority Level (30% weight)
        priority_score = self._calculate_priority_level_score(case.priority_level)
        score += priority_score * (self.PRIORITY_WEIGHTS['case_priority_level'] / 100)
        factors['case_priority_level'] = priority_score
        
        # 3. Client Importance (15% weight)
        client_score = self._calculate_client_importance_score(case.client_importance)
        score += client_score * (self.PRIORITY_WEIGHTS['client_importance'] / 100)
        factors['client_importance'] = client_score
        
        # 4. Case Type Urgency (10% weight)
        type_score = self._calculate_case_type_score(case.case_type)
        score += type_score * (self.PRIORITY_WEIGHTS['case_type_urgency'] / 100)
        factors['case_type_urgency'] = type_score
        
        # 5. Activity Recency (5% weight)
        activity_score = self._calculate_activity_score(case.last_activity)
        score += activity_score * (self.PRIORITY_WEIGHTS['activity_recency'] / 100)
        factors['activity_recency'] = activity_score
        
        # Apply status-based modifiers
        score = self._apply_status_modifiers(score, case.status)
        
        logger.info(f"Priority calculated for case {case.case_number}: {score:.2f}")
        return min(100, max(0, score)), factors
    
    def _calculate_deadline_score(self, case):
        """Calculate score based on deadline urgency (0-100)"""
        if not case.deadline:
            return 20  # No deadline = medium urgency
        
        time_diff = case.deadline - self.current_time
        days_remaining = time_diff.days
        hours_remaining = time_diff.total_seconds() / 3600
        
        if days_remaining < 0:
            # Overdue cases get maximum urgency
            overdue_days = abs(days_remaining)
            return min(100, 95 + overdue_days)  # Cap at 100
        elif hours_remaining <= 24:
            # Due within 24 hours
            return 90
        elif days_remaining <= 3:
            # Due within 3 days
            return 80 - (days_remaining * 5)
        elif days_remaining <= 7:
            # Due within a week
            return 65 - (days_remaining * 3)
        elif days_remaining <= 30:
            # Due within a month
            return 40 - (days_remaining * 1)
        else:
            # More than a month away
            return max(10, 30 - (days_remaining / 10))
    
    def _calculate_priority_level_score(self, priority_level):
        """Convert priority level to score (0-100)"""
        priority_scores = {
            1: 100,  # Critical
            2: 80,   # High
            3: 60,   # Medium
            4: 40,   # Low
            5: 20    # Routine
        }
        return priority_scores.get(priority_level, 60)
    
    def _calculate_client_importance_score(self, client_importance):
        """Calculate score based on client importance (0-100)"""
        if not client_importance:
            return 50
        
        # Convert 1-5 scale to 0-100 scale
        return (client_importance - 1) * 25
    
    def _calculate_case_type_score(self, case_type):
        """Calculate score based on case type urgency (0-100)"""
        if case_type in self.URGENT_CASE_TYPES:
            return 80
        elif case_type in ['family', 'property']:
            return 60
        elif case_type in ['civil', 'corporate']:
            return 40
        else:
            return 30
    
    def _calculate_activity_score(self, last_activity):
        """Calculate score based on recent activity (0-100)"""
        if not last_activity:
            return 0
        
        days_since_activity = (self.current_time - last_activity).days
        
        if days_since_activity == 0:
            return 100
        elif days_since_activity <= 3:
            return 80
        elif days_since_activity <= 7:
            return 60
        elif days_since_activity <= 14:
            return 40
        elif days_since_activity <= 30:
            return 20
        else:
            return 0  # Stale cases get lower priority
    
    def _apply_status_modifiers(self, base_score, status):
        """Apply status-based score modifiers"""
        status_modifiers = {
            'filed': 1.1,        # New cases get slight boost
            'investigation': 1.0,  # Normal priority
            'hearing': 1.2,       # Hearing cases are more urgent
            'trial': 1.3,         # Trial cases are most urgent
            'on_hold': 0.5,       # On hold cases get reduced priority
            'closed': 0.1         # Closed cases get minimal priority
        }
        
        modifier = status_modifiers.get(status, 1.0)
        return base_score * modifier

class CasePriorityManager:
    """Manage case prioritization across the system"""
    
    def __init__(self):
        self.calculator = CasePriorityCalculator()
    
    def update_case_priority(self, case):
        """Update priority for a single case"""
        try:
            score, factors = self.calculator.calculate_case_priority(case)
            case.urgency_score = score
            case.save(update_fields=['urgency_score'])
            
            logger.info(f"Updated priority for case {case.case_number}: {score}")
            return score, factors
            
        except Exception as e:
            logger.error(f"Error updating priority for case {case.case_number}: {e}")
            return None, {}
    
    def bulk_update_priorities(self, cases_queryset):
        """Update priorities for multiple cases efficiently"""
        updated_count = 0
        
        for case in cases_queryset.select_related('client'):
            try:
                score, _ = self.calculator.calculate_case_priority(case)
                case.urgency_score = score
                case.save(update_fields=['urgency_score'])
                updated_count += 1
                
            except Exception as e:
                logger.error(f"Error updating case {case.case_number}: {e}")
                continue
        
        logger.info(f"Updated priorities for {updated_count} cases")
        return updated_count
    
    def get_prioritized_cases(self, user, limit=None):
        """Get cases ordered by priority for a specific user"""
        from cases.models import Case  # Import here to avoid circular import
        
        # Get user's cases
        if user.user_type == 'lawyer':
            cases = Case.objects.filter(assigned_lawyer=user)
        elif user.user_type == 'client':
            cases = Case.objects.filter(client=user)
        else:  # admin
            cases = Case.objects.all()
        
        # Order by priority
        prioritized_cases = cases.order_by(
            'priority_level',
            '-urgency_score',
            'deadline'
        ).select_related('client', 'assigned_lawyer')
        
        if limit:
            prioritized_cases = prioritized_cases[:limit]
        
        return prioritized_cases
    
    def get_urgent_cases(self, urgency_threshold=70):
        """Get all urgent cases across the system"""
        from cases.models import Case
        
        return Case.objects.filter(
            urgency_score__gte=urgency_threshold
        ).exclude(
            status='closed'
        ).order_by('-urgency_score')
    
    def get_overdue_cases(self):
        """Get all overdue cases"""
        from cases.models import Case
        
        return Case.objects.filter(
            deadline__lt=timezone.now(),
            status__in=['filed', 'investigation', 'hearing', 'trial']
        ).order_by('deadline')
    
    def get_priority_statistics(self, user=None):
        """Get priority-related statistics"""
        from cases.models import Case
        
        # Filter cases based on user
        if user:
            if user.user_type == 'lawyer':
                cases = Case.objects.filter(assigned_lawyer=user)
            elif user.user_type == 'client':
                cases = Case.objects.filter(client=user)
            else:
                cases = Case.objects.all()
        else:
            cases = Case.objects.all()
        
        # Calculate statistics
        stats = {
            'total_cases': cases.count(),
            'critical_cases': cases.filter(priority_level=1).count(),
            'high_priority_cases': cases.filter(priority_level=2).count(),
            'overdue_cases': cases.filter(deadline__lt=timezone.now()).count(),
            'due_this_week': cases.filter(
                deadline__gte=timezone.now(),
                deadline__lte=timezone.now() + timedelta(days=7)
            ).count(),
            'urgent_cases': cases.filter(urgency_score__gte=70).count(),
            'average_urgency_score': cases.aggregate(
                avg_score=Avg('urgency_score')
            )['avg_score'] or 0,
            'cases_by_status': dict(
                cases.values('status').annotate(
                    count=Count('status')
                ).values_list('status', 'count')
            )
        }
        
        return stats

def schedule_priority_updates():
    """
    Function to be called by Celery task scheduler
    Updates priorities for all active cases
    """
    from cases.models import Case
    
    manager = CasePriorityManager()
    
    # Only update active cases (not closed)
    active_cases = Case.objects.exclude(status='closed')
    
    updated_count = manager.bulk_update_priorities(active_cases)
    
    logger.info(f"Scheduled priority update completed: {updated_count} cases updated")
    return updated_count

def identify_urgent_actions():
    """
    Identify cases that need immediate attention
    Returns a list of action items
    """
    manager = CasePriorityManager()
    actions = []
    
    # Overdue cases
    overdue_cases = manager.get_overdue_cases()[:10]  # Limit to top 10
    for case in overdue_cases:
        actions.append({
            'type': 'overdue',
            'priority': 'critical',
            'case_id': case.id,
            'case_number': case.case_number,
            'message': f'Case #{case.case_number} is overdue by {(timezone.now() - case.deadline).days} days'
        })
    
    # High urgency cases without lawyers
    unassigned_urgent = manager.get_urgent_cases().filter(assigned_lawyer__isnull=True)[:5]
    for case in unassigned_urgent:
        actions.append({
            'type': 'unassigned_urgent',
            'priority': 'high',
            'case_id': case.id,
            'case_number': case.case_number,
            'message': f'Urgent case #{case.case_number} needs lawyer assignment'
        })
    
    # Cases with no recent activity
    from cases.models import Case
    stale_cases = Case.objects.filter(
        last_activity__lt=timezone.now() - timedelta(days=14),
        status__in=['filed', 'investigation']
    ).order_by('-urgency_score')[:5]
    
    for case in stale_cases:
        actions.append({
            'type': 'stale_case',
            'priority': 'medium',
            'case_id': case.id,
            'case_number': case.case_number,
            'message': f'Case #{case.case_number} has no recent activity for {(timezone.now() - case.last_activity).days} days'
        })
    
    return actions