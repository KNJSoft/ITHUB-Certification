from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView, token_refresh, verify_email, forgot_password, reset_password,
    QuizListView, QuizDetailView, QuizAttemptView,
    CertificationListView, certification_png, certification_pdf,
    admin_stats, recent_activity, security_data, UserListView, UserCreateView, UserUpdateView, UserDeleteView,
    QuizAdminListView, QuizAdminCreateView, QuizAdminDetailView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/verify-email/', verify_email, name='verify_email'),
    path('auth/forgot-password/', forgot_password, name='forgot_password'),
    path('auth/reset-password/', reset_password, name='reset_password'),
    path('auth/token/refresh/', token_refresh, name='token_refresh'),
    path('auth/me/', ProfileView.as_view(), name='profile'),
    
    # Quiz (Student)
    path('quizzes/', QuizListView.as_view(), name='quiz_list'),
    path('quizzes/<uuid:id>/', QuizDetailView.as_view(), name='quiz_detail'),
    path('quizzes/<uuid:id>/attempt/', QuizAttemptView.as_view(), name='quiz_attempt'),
    
    # Certifications (Student)
    path('certifications/', CertificationListView.as_view(), name='certification_list'),
    path('certifications/<uuid:certification_id>/png/', certification_png, name='certification_png'),
    path('certifications/<uuid:certification_id>/pdf/', certification_pdf, name='certification_pdf'),
    
    # Admin
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/recent-activity/', recent_activity, name='admin_recent_activity'),
    path('admin/security/', security_data, name='admin_security'),
    path('admin/users/', UserListView.as_view(), name='admin_users'),
    path('admin/users/create/', UserCreateView.as_view(), name='admin_user_create'),
    path('admin/users/<uuid:user_id>/', UserUpdateView.as_view(), name='admin_user_update'),
    path('admin/users/<uuid:user_id>/delete/', UserDeleteView.as_view(), name='admin_user_delete'),
    path('admin/quizzes/', QuizAdminListView.as_view(), name='admin_quiz_list'),
    path('admin/quizzes/create/', QuizAdminCreateView.as_view(), name='admin_quiz_create'),
    path('admin/quizzes/<uuid:quiz_id>/', QuizAdminDetailView.as_view(), name='admin_quiz_detail'),
]
