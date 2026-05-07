from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView, token_refresh,
    QuizListView, QuizDetailView, QuizAttemptView,
    CertificationListView, certification_png, certification_pdf,
    admin_stats, UserListView, QuizAdminListView, QuizAdminCreateView, QuizAdminDetailView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', token_refresh, name='token_refresh'),
    path('auth/me/', ProfileView.as_view(), name='profile'),
    
    # Quiz (Student)
    path('quizzes/', QuizListView.as_view(), name='quiz_list'),
    path('quizzes/<uuid:quiz_id>/', QuizDetailView.as_view(), name='quiz_detail'),
    path('quizzes/<uuid:quiz_id>/attempt/', QuizAttemptView.as_view(), name='quiz_attempt'),
    
    # Certifications (Student)
    path('certifications/', CertificationListView.as_view(), name='certification_list'),
    path('certifications/<uuid:certification_id>/png/', certification_png, name='certification_png'),
    path('certifications/<uuid:certification_id>/pdf/', certification_pdf, name='certification_pdf'),
    
    # Admin
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/users/', UserListView.as_view(), name='admin_users'),
    path('admin/quizzes/', QuizAdminListView.as_view(), name='admin_quiz_list'),
    path('admin/quizzes/create/', QuizAdminCreateView.as_view(), name='admin_quiz_create'),
    path('admin/quizzes/<uuid:quiz_id>/', QuizAdminDetailView.as_view(), name='admin_quiz_detail'),
]
