from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import status
from .models import CaseDetail, Lawyer
from .serializers import CaseDetailSerializer, RegisterSerializer, LawyerSerializer
import numpy as np
import pandas as pd
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny



@api_view(['GET'])
def get_case(request):
    cases = CaseDetail.objects.all()
    serializer = CaseDetailSerializer(cases, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_case(request):
    serializer = CaseDetailSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_case_id(request, id):
    try:
        case = CaseDetail.objects.get(pk=id)
        serializer = CaseDetailSerializer(case)
        return Response(serializer.data)
    except CaseDetail.DoesNotExist:
        return Response({"error": "Case not found"}, status=404)

@api_view(['PUT'])    
def update_case(request, id):
    try:
        case = CaseDetail.objects.get(pk=id)
        serializer = CaseDetailSerializer(case, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except CaseDetail.DoesNotExist:
        return Response({"error": "Case not found"}, status=404)

@api_view(['DELETE'])    
def delete_case(request, id):
    try:
        case = CaseDetail.objects.get(pk=id)
        case.delete()
        return Response({"message": "Case deleted successfully"}, status=200)
    except CaseDetail.DoesNotExist:
        return Response({"error": "Case not found"}, status=404)

    
@api_view(['GET'])
def get_lawyer_details(request):
    if request.user.is_authenticated:
        try:
            lawyer=Lawyer.objects.get(user=request.user)
            serializer = LawyerSerializer(lawyer)
            return Response(serializer.data)
        except Lawyer.DoesNotExist:
            return Response({"error": "Lawyer not found"}, status=404)
    return Response({"error": "Unauthorized"}, status=401)

@api_view(['GET'])
def case_prioritization(request):
    cases = CaseDetail.objects.all()
    if not cases:
        return Response({"message": "No cases available for prioritization"}, status=404)
    
    case_data = list(cases.values("case_id", "case_type", "case_urgency", "evidence_count", "case_date"))
    df = pd.DataFrame(case_data)
    df["case_date"] = pd.to_datetime(df["case_date"]).dt.tz_localize(None)
    
    # Ensure the current time is also timezone-naive
    current_time = pd.Timestamp.now().tz_localize(None)
    
    # Calculate priority score
    df["priority_score"] = (
        df["case_urgency"] * 2 
        + df["evidence_count"] 
        - (current_time - df["case_date"]).dt.days * 0.1
    )

    # Sort by priority score
    df = df.sort_values(by="priority_score", ascending=False)
    prioritized_case = df.to_dict(orient="records")
    
    return Response(prioritized_case, status=200)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user_type = request.data.get('userType')

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'username': user.username,
                'userType': user_type,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)