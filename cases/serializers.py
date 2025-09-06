from rest_framework import serializers
from .models import CaseDetail, Lawyer
from django.contrib.auth.models import User

class CaseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseDetail
        fields = '__all__'
    
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    userType = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'userType')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match!")
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('userType')
        validated_data.pop('password2')  # Remove password2 as it's not needed for user creation
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        
        # Create Lawyer profile if userType is Law Firm
        if user_type == 'Law Firm':
            Lawyer.objects.create(
                user=user,
                name=validated_data['username'],  # You can update this later
                email=validated_data.get('email'),
                phone='',  # Default empty, can be updated later
                experience=0,  # Default value
                specialization='General'  # Default value
            )
        
        return user
    
class LawyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lawyer
        fields = ['name', 'email', 'phone', 'experience', 'specialization']