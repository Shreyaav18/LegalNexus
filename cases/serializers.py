from rest_framework import serializers
from .models import CaseDetail
from django.contrib.auth.models import User

class CaseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=CaseDetail
        fields='__all__'
    
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
    
class LawyerSerializer(serializers.ModelSerializer):
    class Meta:
        fields=['name', 'email', 'phone', 'experience', 'specialization']