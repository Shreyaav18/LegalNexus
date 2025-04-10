from django.urls import path
from .views import get_case, create_case, get_case_id, update_case, delete_case, case_prioritization, RegisterView, LoginView, get_lawyer_details

urlpatterns = [
    path('cases/', get_case, name='get_cases'),
    path('cases/create/', create_case, name='create_case'),
    path('cases/<int:id>/', get_case_id, name='get_case_by_id'),
    path('cases/<int:id>/update/', update_case, name='update_case'),
    path('cases/<int:id>/delete/', delete_case, name='delete_case'),
    path('cases/prioritize/', case_prioritization, name='case_prioritization'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('lawyer-details/', get_lawyer_details, name='lawyer-details'),
]