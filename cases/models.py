from django.db import models
from django.contrib.auth.models import User

class CaseDetail(models.Model):
    case_id=models.AutoField(primary_key=True)
    case_type=models.CharField(max_length=255)
    case_urgency=models.IntegerField()
    evidence_count=models.IntegerField(default=0)
    case_date=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Case {self.case_id} - {self.case_type}"
    
    
class Lawyer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="lawyer_profile",  null=True, blank=True)  # ✅ Link to User
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    experience = models.PositiveIntegerField()
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return self.name

