# setup_database.py - Setup script for Legal Nexus database

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'case_prioritization.settings')
django.setup()

from cases.models import (
    User, LawyerProfile, Case, CaseDocument, 
    CaseActivity, LegalNews, Notification
)
from cases.utils.prioritization import CasePriorityManager

class DatabaseSetup:
    """Setup database with initial data for Legal Nexus"""
    
    def __init__(self):
        self.priority_manager = CasePriorityManager()
    
    def run_migrations(self):
        """Run database migrations"""
        print("Running database migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        print("✓ Migrations completed")
    
    def create_superuser(self):
        """Create admin superuser"""
        User = get_user_model()
        
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@legalnexus.com',
                password='admin123',
                user_type='admin',
                first_name='Admin',
                last_name='User'
            )
            print("✓ Admin user created (username: admin, password: admin123)")
        else:
            print("✓ Admin user already exists")
    
    def create_sample_users(self):
        """Create sample lawyers and clients"""
        print("Creating sample users...")
        
        # Create lawyers
        lawyers_data = [
            {
                'username': 'sarah_johnson',
                'email': 'sarah@legalnexus.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'specializations': ['Criminal', 'Personal Injury'],
                'experience_years': 8,
                'bar_association': 'State Bar Association'
            },
            {
                'username': 'michael_brown',
                'email': 'michael@legalnexus.com',
                'first_name': 'Michael',
                'last_name': 'Brown',
                'specializations': ['Corporate', 'Contract Law'],
                'experience_years': 12,
                'bar_association': 'State Bar Association'
            },
            {
                'username': 'emily_davis',
                'email': 'emily@legalnexus.com',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'specializations': ['Family Law', 'Immigration'],
                'experience_years': 6,
                'bar_association': 'State Bar Association'
            }
        ]
        
        for lawyer_data in lawyers_data:
            if not User.objects.filter(username=lawyer_data['username']).exists():
                user = User.objects.create_user(
                    username=lawyer_data['username'],
                    email=lawyer_data['email'],
                    password='password123',
                    user_type='lawyer',
                    first_name=lawyer_data['first_name'],
                    last_name=lawyer_data['last_name'],
                    is_verified=True
                )
                
                LawyerProfile.objects.create(
                    user=user,
                    license_number=f"LIC{str(user.id)[:8]}",
                    specializations=lawyer_data['specializations'],
                    experience_years=lawyer_data['experience_years'],
                    bar_association=lawyer_data['bar_association'],
                    hourly_rate=Decimal(str(random.randint(200, 500))),
                    availability_status='available',
                    rating=round(random.uniform(4.0, 5.0), 1)
                )
        
        # Create clients
        clients_data = [
            {'username': 'john_doe', 'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'},
            {'username': 'jane_smith', 'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Smith'},
            {'username': 'robert_wilson', 'email': 'robert@example.com', 'first_name': 'Robert', 'last_name': 'Wilson'},
            {'username': 'abc_corp', 'email': 'contact@abccorp.com', 'first_name': 'ABC', 'last_name': 'Corp'},
            {'username': 'mary_johnson', 'email': 'mary@example.com', 'first_name': 'Mary', 'last_name': 'Johnson'},
        ]
        
        for client_data in clients_data:
            if not User.objects.filter(username=client_data['username']).exists():
                User.objects.create_user(
                    username=client_data['username'],
                    email=client_data['email'],
                    password='password123',
                    user_type='client',
                    first_name=client_data['first_name'],
                    last_name=client_data['last_name'],
                    is_verified=True
                )
        
        print("✓ Sample users created")
    
    def create_sample_cases(self):
        """Create sample cases with varying priorities"""
        print("Creating sample cases...")
        
        lawyers = User.objects.filter(user_type='lawyer')
        clients = User.objects.filter(user_type='client')
        
        if not lawyers.exists() or not clients.exists():
            print("❌ No lawyers or clients found. Create users first.")
            return
        
        cases_data = [
            {
                'title': 'Personal Injury Claim - Car Accident',
                'description': 'Client injured in multi-vehicle collision. Seeking compensation for medical expenses and lost wages.',
                'case_type': 'personal_injury',
                'priority_level': 1,
                'status': 'investigation',
                'client_importance': 4,
                'deadline_days': -2,  # Overdue
                'estimated_cost': Decimal('15000.00')
            },
            {
                'title': 'Criminal Defense - Theft Charges',
                'description': 'Client facing theft charges. Court hearing scheduled.',
                'case_type': 'criminal',
                'priority_level': 1,
                'status': 'hearing',
                'client_importance': 5,
                'deadline_days': 3,
                'estimated_cost': Decimal('8000.00')
            },
            {
                'title': 'Contract Dispute - Business Partnership',
                'description': 'Partnership agreement dispute requiring legal resolution.',
                'case_type': 'corporate',
                'priority_level': 2,
                'status': 'filed',
                'client_importance': 4,
                'deadline_days': 14,
                'estimated_cost': Decimal('25000.00')
            },
            {
                'title': 'Family Law - Child Custody',
                'description': 'Child custody arrangement modification case.',
                'case_type': 'family',
                'priority_level': 3,
                'status': 'investigation',
                'client_importance': 3,
                'deadline_days': 28,
                'estimated_cost': Decimal('5000.00')
            },
            {
                'title': 'Immigration - Work Visa Application',
                'description': 'H1-B visa application and documentation review.',
                'case_type': 'immigration',
                'priority_level': 2,
                'status': 'filed',
                'client_importance': 3,
                'deadline_days': 7,
                'estimated_cost': Decimal('3000.00')
            },
            {
                'title': 'Property Dispute - Boundary Issue',
                'description': 'Neighbor dispute over property boundaries.',
                'case_type': 'property',
                'priority_level': 4,
                'status': 'investigation',
                'client_importance': 2,
                'deadline_days': 45,
                'estimated_cost': Decimal('4500.00')
            },
            {
                'title': 'Civil Rights Violation Case',
                'description': 'Workplace discrimination case requiring immediate attention.',
                'case_type': 'civil',
                'priority_level': 1,
                'status': 'hearing',
                'client_importance': 5,
                'deadline_days': 1,
                'estimated_cost': Decimal('20000.00')
            },
            {
                'title': 'Corporate Merger Legal Review',
                'description': 'Due diligence and legal review for corporate acquisition.',
                'case_type': 'corporate',
                'priority_level': 3,
                'status': 'investigation',
                'client_importance': 4,
                'deadline_days': 21,
                'estimated_cost': Decimal('50000.00')
            }
        ]
        
        for i, case_data in enumerate(cases_data):
            if not Case.objects.filter(title=case_data['title']).exists():
                # Assign client and lawyer
                client = clients[i % clients.count()]
                lawyer = lawyers[i % lawyers.count()] if i % 3 != 0 else None  # Some unassigned
                
                # Calculate deadline
                if case_data['deadline_days'] < 0:
                    deadline = timezone.now() + timezone.timedelta(days=case_data['deadline_days'])
                else:
                    deadline = timezone.now() + timezone.timedelta(days=case_data['deadline_days'])
                
                case = Case.objects.create(
                        title=case_data['title'],
                        description=case_data['description'],
                        case_type=case_data['case_type'],
                        client=client,
                        assigned_lawyer=lawyer,
                        priority_level=case_data['priority_level'],
                        status=case_data['status'],
                        client_importance=case_data['client_importance'],
                        deadline=deadline,
                        estimated_cost=case_data['estimated_cost'],
                        filing_date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                        case_number=f"LN{timezone.now().year}{i:06d}"  # Use loop index instead
                        )
                
                # Generate case number
                case.case_number = f"LN{timezone.now().year}{str(case.pk)[:6]}{i:03d}"
                case.save()
                
                # Calculate initial priority
                self.priority_manager.update_case_priority(case)
                
                # Create initial activity
                CaseActivity.objects.create(
                    case=case,
                    activity_type='status_change',
                    description=f'Case created with status: {case.status}',
                    performed_by=client
                )
                
                if lawyer:
                    CaseActivity.objects.create(
                        case=case,
                        activity_type='assignment',
                        description=f'Case assigned to {lawyer.get_full_name()}',
                        performed_by=client
                    )
        
        print("✓ Sample cases created")
    
    def create_legal_news(self):
        """Create sample legal news items"""
        print("Creating legal news...")
        
        news_items = [
            {
                'title': 'Supreme Court issues new guidelines on cybercrime',
                'content': 'The Supreme Court has issued comprehensive guidelines for handling cybercrime cases, emphasizing the need for specialized investigation techniques and digital evidence preservation.',
                'category': 'Criminal Law',
                'source': 'Legal Today',
                'is_featured': True
            },
            {
                'title': 'Amendments made to data privacy law',
                'content': 'New amendments to the Data Privacy Protection Act now require stricter consent mechanisms for data collection and processing.',
                'category': 'Privacy Law',
                'source': 'Privacy Journal',
                'is_featured': False
            },
            {
                'title': 'Online dispute resolution platform launched',
                'content': 'A new government-backed online dispute resolution platform has been launched to handle civil disputes more efficiently.',
                'category': 'Civil Law',
                'source': 'Court News',
                'is_featured': True
            },
            {
                'title': 'Corporate governance reforms announced',
                'content': 'New corporate governance standards have been announced, requiring enhanced transparency and accountability measures.',
                'category': 'Corporate Law',
                'source': 'Business Legal Review',
                'is_featured': False
            }
        ]
        
        for news_data in news_items:
            if not LegalNews.objects.filter(title=news_data['title']).exists():
                LegalNews.objects.create(
                    title=news_data['title'],
                    content=news_data['content'],
                    category=news_data['category'],
                    source=news_data['source'],
                    published_date=timezone.now() - timezone.timedelta(days=random.randint(0, 7)),
                    is_featured=news_data['is_featured']
                )
        
        print("✓ Legal news created")
    
    def create_sample_notifications(self):
        """Create sample notifications"""
        print("Creating sample notifications...")
        
        users = User.objects.filter(user_type__in=['lawyer', 'client'])
        cases = Case.objects.all()
        
        if not users.exists() or not cases.exists():
            print("❌ No users or cases found for notifications")
            return
        
        # Create notifications for overdue cases
        overdue_cases = cases.filter(deadline__lt=timezone.now())
        for case in overdue_cases:
            if case.assigned_lawyer:
                Notification.objects.get_or_create(
                    recipient=case.assigned_lawyer,
                    notification_type='case_update',
                    title='Case Overdue',
                    message=f'Case #{case.case_number} is overdue and requires immediate attention.',
                    related_case=case,
                    defaults={'is_read': False}
                )
            
            Notification.objects.get_or_create(
                recipient=case.client,
                notification_type='case_update',
                title='Case Status Update',
                message=f'Your case #{case.case_number} requires attention due to approaching deadline.',
                related_case=case,
                defaults={'is_read': False}
            )
        
        print("✓ Sample notifications created")
    
    def setup_database(self):
        """Run complete database setup"""
        print("🚀 Starting Legal Nexus database setup...")
        print("=" * 50)
        
        try:
            self.run_migrations()
            self.create_superuser()
            self.create_sample_users()
            self.create_sample_cases()
            self.create_legal_news()
            self.create_sample_notifications()
            
            print("=" * 50)
            print("✅ Database setup completed successfully!")
            print("\n📋 Setup Summary:")
            print(f"   • Users created: {User.objects.count()}")
            print(f"   • Lawyers: {User.objects.filter(user_type='lawyer').count()}")
            print(f"   • Clients: {User.objects.filter(user_type='client').count()}")
            print(f"   • Cases created: {Case.objects.count()}")
            print(f"   • Legal news items: {LegalNews.objects.count()}")
            print(f"   • Notifications: {Notification.objects.count()}")
            
            print("\n🔐 Login Credentials:")
            print("   Admin: username=admin, password=admin123")
            print("   Lawyers: username=sarah_johnson, password=password123")
            print("           username=michael_brown, password=password123")
            print("           username=emily_davis, password=password123")
            print("   Clients: username=john_doe, password=password123")
            print("           username=jane_smith, password=password123")
            print("           (and more...)")
            
            print("\n🌐 Next Steps:")
            print("   1. Start your Django server: python manage.py runserver")
            print("   2. Start Redis server for real-time features")
            print("   3. Access admin panel at: http://localhost:8000/admin")
            print("   4. Test the API endpoints")
            
        except Exception as e:
            print(f"❌ Error during setup: {e}")
            sys.exit(1)

# Celery tasks for background processing
celery_tasks_code = '''
# tasks.py - Celery tasks for background processing

from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Case, Notification
from .utils.prioritization import CasePriorityManager, schedule_priority_updates
from .utils.notifications import send_email_notification
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def recalculate_all_case_priorities():
    """
    Scheduled task to recalculate priorities for all active cases
    Should run every hour
    """
    try:
        updated_count = schedule_priority_updates()
        logger.info(f"Priority recalculation task completed: {updated_count} cases updated")
        return f"Updated {updated_count} cases"
    except Exception as e:
        logger.error(f"Error in priority recalculation task: {e}")
        raise

@shared_task
def send_deadline_reminders():
    """
    Send email reminders for cases approaching deadlines
    Should run daily
    """
    try:
        tomorrow = timezone.now() + timezone.timedelta(days=1)
        next_week = timezone.now() + timezone.timedelta(days=7)
        
        # Cases due tomorrow
        urgent_cases = Case.objects.filter(
            deadline__date=tomorrow.date(),
            status__in=['filed', 'investigation', 'hearing']
        ).select_related('client', 'assigned_lawyer')
        
        # Cases due next week
        upcoming_cases = Case.objects.filter(
            deadline__gte=next_week,
            deadline__lte=next_week + timezone.timedelta(days=1),
            status__in=['filed', 'investigation', 'hearing']
        ).select_related('client', 'assigned_lawyer')
        
        reminder_count = 0
        
        for case in urgent_cases:
            # Create notification
            for user in [case.client, case.assigned_lawyer]:
                if user:
                    Notification.objects.create(
                        recipient=user,
                        notification_type='hearing_reminder',
                        title='Urgent: Case Due Tomorrow',
                        message=f'Case #{case.case_number} is due tomorrow. Please review immediately.',
                        related_case=case
                    )
                    reminder_count += 1
        
        for case in upcoming_cases:
            # Create notification
            for user in [case.client, case.assigned_lawyer]:
                if user:
                    Notification.objects.create(
                        recipient=user,
                        notification_type='hearing_reminder',
                        title='Reminder: Case Due Next Week',
                        message=f'Case #{case.case_number} is due next week. Please prepare accordingly.',
                        related_case=case
                    )
                    reminder_count += 1
        
        logger.info(f"Sent {reminder_count} deadline reminders")
        return f"Sent {reminder_count} deadline reminders"
        
    except Exception as e:
        logger.error(f"Error sending deadline reminders: {e}")
        raise

@shared_task
def cleanup_old_notifications():
    """
    Clean up old notifications
    Should run weekly
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=90)
        deleted_count = Notification.objects.filter(created_at__lt=cutoff_date).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old notifications")
        return f"Deleted {deleted_count} old notifications"
        
    except Exception as e:
        logger.error(f"Error cleaning up notifications: {e}")
        raise

@shared_task
def generate_priority_report():
    """
    Generate daily priority report for admins
    """
    try:
        manager = CasePriorityManager()
        stats = manager.get_priority_statistics()
        urgent_cases = manager.get_urgent_cases(urgency_threshold=80)[:10]
        
        # Send report to admin users
        admins = User.objects.filter(user_type='admin')
        
        report_content = f"""
        Daily Priority Report - {timezone.now().strftime('%Y-%m-%d')}
        
        Summary:
        - Total Cases: {stats['total_cases']}
        - Critical Cases: {stats['critical_cases']}
        - Overdue Cases: {stats['overdue_cases']}
        - Average Priority Score: {stats['average_urgency_score']:.1f}
        
        Top Urgent Cases:
        """
        
        for case in urgent_cases:
            report_content += f"- #{case.case_number}: {case.title} (Score: {case.urgency_score})\n"
        
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                notification_type='system',
                title='Daily Priority Report',
                message=report_content
            )
        
        logger.info("Generated daily priority report")
        return "Priority report generated"
        
    except Exception as e:
        logger.error(f"Error generating priority report: {e}")
        raise
'''

if __name__ == "__main__":
    setup = DatabaseSetup()
    setup.setup_database()