from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models import Count, Q
from django.http import HttpResponse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.template.loader import render_to_string
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import User, Quiz, Question, Option, Attempt, Certification, Device, IP
from .serializers import (
    UserRegistrationSerializer, UserUpdateSerializer, UserLoginSerializer, UserProfileSerializer,
    QuizListSerializer, QuizDetailSerializer, QuizCreateSerializer, QuizAdminSerializer, QuizAdminUpdateSerializer,
    AttemptSubmitSerializer, AttemptResultSerializer, CertificationSerializer,
    UserListSerializer, StatsSerializer
)
from .utils import generate_certification_files
from .permissions import IsAdmin, IsStudent, IsOwnerOrAdmin, IsAdminOrReadOnly, IsStudentOrAdmin


# --- Authentication Views ---
@extend_schema(
    tags=['Authentication'],
    summary='Inscription d\'un nouvel utilisateur',
    description='Crée un nouveau compte étudiant sur la plateforme avec optionnellement une photo de profil, numéro de téléphone et pays',
    request=UserRegistrationSerializer,
    responses={201: UserProfileSerializer}
)
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Générer un code de vérification
            verification_code = get_random_string(6, allowed_chars='0123456789')
            user.verification_code = verification_code
            user.verification_code_created_at = timezone.now()
            user.is_verified = False
            user.is_active = True  # Désactiver le compte jusqu'à vérification
            user.save()
            
            # Envoyer l'email de vérification
            try:
                # Rendre le template HTML
                html_message = render_to_string('verification_email.html', {
                    'verification_code': verification_code
                })
                
                send_mail(
                    'Vérification de votre compte IT HUB Certification',
                    '',  # Message texte vide car on utilise HTML
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                # En cas d'erreur d'envoi d'email, réactiver le compte pour le développement
                user.is_active = True
                user.save()
                print(f"Erreur lors de l'envoi de l'email: {e}")
            
            return Response({
                'message': 'Un code de vérification a été envoyé à votre email',
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Authentication'],
    summary='Demander la réinitialisation du mot de passe',
    description='Envoie un code de réinitialisation par email',
    request={
        'type': 'object',
        'properties': {
            'email': {'type': 'string'}
        }
    },
    responses={200: {'message': 'Un code de réinitialisation a été envoyé à votre email'}}
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Générer un code de réinitialisation
        reset_code = get_random_string(6, allowed_chars='0123456789')
        user.reset_password_code = reset_code
        user.reset_password_code_created_at = timezone.now()
        user.save()
        
        # Rendre le template HTML
        html_message = render_to_string('reset_password_email.html', {
            'reset_code': reset_code
        })
        
        # Envoyer l'email de réinitialisation
        send_mail(
            'Réinitialisation de votre mot de passe IT HUB Certification',
            '',
            settings.EMAIL_HOST_USER,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return Response({
            'message': 'Un code de réinitialisation a été envoyé à votre email',
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
        return Response({
            'message': 'Si cet email existe, un code de réinitialisation a été envoyé'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Erreur lors de l\'envoi de l\'email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['Authentication'],
    summary='Vérifier le code de réinitialisation',
    description='Vérifie le code de réinitialisation et permet de changer le mot de passe',
    request={
        'type': 'object',
        'properties': {
            'email': {'type': 'string'},
            'code': {'type': 'string'},
            'new_password': {'type': 'string'}
        }
    },
    responses={200: {'message': 'Mot de passe réinitialisé avec succès'}}
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not email or not code or not new_password:
        return Response({'error': 'Email, code et nouveau mot de passe requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Vérifier si le code est correct
        if user.reset_password_code != code:
            return Response({'error': 'Code de réinitialisation incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si le code a expiré (15 minutes)
        if user.reset_password_code_created_at:
            expiration_time = user.reset_password_code_created_at + timezone.timedelta(minutes=15)
            if timezone.now() > expiration_time:
                return Response({'error': 'Code de réinitialisation expiré'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Réinitialiser le mot de passe
        user.set_password(new_password)
        user.reset_password_code = None
        user.reset_password_code_created_at = None
        user.save()
        
        return Response({
            'message': 'Mot de passe réinitialisé avec succès'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Authentication'],
    summary='Vérifier l\'email',
    description='Vérifie l\'email de l\'utilisateur avec le code de vérification',
    request={
        'type': 'object',
        'properties': {
            'email': {'type': 'string'},
            'code': {'type': 'string'}
        }
    },
    responses={200: {'message': 'Email vérifié avec succès'}}
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email et code requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Vérifier si le code est correct et n'a pas expiré (24 heures)
        if user.verification_code != code:
            return Response({'error': 'Code de vérification incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si le code a expiré (15 minutes)
        if user.verification_code_created_at:
            expiration_time = user.verification_code_created_at + timezone.timedelta(minutes=15)
            if timezone.now() > expiration_time:
                return Response({'error': 'Code de vérification expiré'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier l'email
        user.is_verified = True
        user.is_active = True
        user.verification_code = None
        user.verification_code_created_at = None
        user.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Email vérifié avec succès',
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Authentication'],
    summary='Connexion utilisateur',
    description='Authentifie un utilisateur et retourne les tokens JWT',
    request=UserLoginSerializer,
    responses={200: UserProfileSerializer}
)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        # Vérifier si l'email est vérifié
        if serializer.is_valid() and not serializer.validated_data['user'].is_verified:
            # Générer un nouveau code de vérification
            verification_code = get_random_string(6, allowed_chars='0123456789')
            serializer.validated_data['user'].verification_code = verification_code
            serializer.validated_data['user'].verification_code_created_at = timezone.now()
            serializer.validated_data['user'].save()

            # Rendre le template HTML
            html_message = render_to_string('verification_email.html', {
                'verification_code': verification_code
            })

            # Envoyer l'email de vérification
            send_mail(
                'Vérification de votre email IT HUB Certification',
                '',
                settings.EMAIL_HOST_USER,
                [serializer.validated_data['user'].email],
                html_message=html_message,
                fail_silently=False,
            )

            return Response({
                'message': 'Email non vérifié. Un nouveau code de vérification a été envoyé.',
                'email_verified': False,
                'redirect_to':'/app/verify-email',
                'email': serializer.validated_data['user'].email
            }, status=status.HTTP_200_OK)
        # elif not serializer.is_valid() and serializer.validated_data['user'].is_verified :
        #     return Response({
        #         'message': 'Désolé votre compte à été désactivé, contactez un administrateur.',
        #         'is_active': False,
        #     }, status=status.HTTP_200_OK)
        if serializer.is_valid() and serializer.validated_data['user'].is_verified:
            user = serializer.validated_data['user']

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Authentication'],
    summary='Rafraîchir le token d\'accès',
    description='Génère un nouveau token d\'accès à partir d\'un refresh token',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'refresh': {'type': 'string', 'description': 'Refresh token JWT'}
            },
            'required': ['refresh']
        }
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access': {'type': 'string', 'description': 'Nouveau token d\'accès'}
            }
        }
    }
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def token_refresh(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Token invalide'}, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(
    tags=['Authentication'],
    summary='Profil utilisateur',
    description='Retourne les informations du profil de l\'utilisateur connecté',
    responses={200: UserProfileSerializer}
)
class ProfileView(APIView):
    permission_classes = [IsStudentOrAdmin]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @extend_schema(
        request=UserProfileSerializer,
        responses={200: UserProfileSerializer}
    )
    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@extend_schema(
    tags=['Authentication'],
    summary='Changer le mot de passe',
    description='Permet à l\'utilisateur connecté de changer son mot de passe',
    request={
        'type': 'object',
        'properties': {
            'old_password': {'type': 'string'},
            'new_password': {'type': 'string'},
            'new_password_confirm': {'type': 'string'}
        },
        'required': ['old_password', 'new_password', 'new_password_confirm']
    },
    responses={200: {'type': 'object', 'properties': {'success': {'type': 'boolean'}}}}
)
class ChangePasswordView(APIView):
    permission_classes = [IsStudentOrAdmin]
    
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')
        
        if not old_password or not new_password or not new_password_confirm:
            return Response({'error': 'Tous les champs sont requis'}, status=400)
        
        if new_password != new_password_confirm:
            return Response({'error': 'Les mots de passe ne correspondent pas'}, status=400)
        
        if not request.user.check_password(old_password):
            return Response({'error': 'L\'ancien mot de passe est incorrect'}, status=400)
        
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({'success': True})


# --- Quiz Views (Student) ---
@extend_schema(
    tags=['Student Portal'],
    summary='Lister les quiz disponibles',
    description='Retourne la liste des quiz actifs et non expirés',
    responses={200: QuizListSerializer}
)
class QuizListView(ListAPIView):
    serializer_class = QuizListSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Quiz.objects.filter(is_active=True, expiration_date__gt=timezone.now())


@extend_schema(
    tags=['Student Portal'],
    summary='Détails d\'un quiz',
    description='Retourne les détails d\'un quiz avec les questions (sans les bonnes réponses)',
    responses={200: QuizDetailSerializer}
)
class QuizDetailView(RetrieveAPIView):
    serializer_class = QuizDetailSerializer
    permission_classes = [IsStudent]
    lookup_field = 'id'

    def get_queryset(self):
        return Quiz.objects.filter(is_active=True, expiration_date__gt=timezone.now())


@extend_schema(
    tags=['Student Portal'],
    summary='Soumettre une tentative de quiz',
    description='Enregistre les réponses d\'un utilisateur à un quiz et calcule le score',
    request=AttemptSubmitSerializer,
    responses={
        201: {
            'type': 'object',
            'properties': {
                'attempt': {'type': 'object', 'description': 'Détails de la tentative'},
                'correct_answers': {'type': 'object', 'description': 'Carte des bonnes réponses'},
                'remaining_attempts': {'type': 'integer', 'description': 'Tentatives restantes'},
                'certification_obtained': {'type': 'boolean', 'description': 'Attestation obtenue'}
            }
        }
    }
)
class QuizAttemptView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, id):
        try:
            quiz = Quiz.objects.get(id=id)
            
            # Permission class already ensures only students can access
            
            # Check if quiz is available
            if not quiz.is_available:
                return Response(
                    {'error': 'Ce quiz n\'est pas disponible'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check max attempts
            attempt_count = Attempt.objects.filter(user=request.user, quiz=quiz).count()
            if attempt_count >= quiz.max_attempts:
                return Response(
                    {'error': 'Nombre maximum de tentatives atteint'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate answers
            serializer = AttemptSubmitSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            answers = serializer.validated_data['answers']
            
            # Calculate score
            total_questions = quiz.questions.count()
            if total_questions == 0:
                return Response(
                    {'error': 'Ce quiz n\'a pas de questions'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            correct_answers = 0
            correct_answers_data = {}
            
            for question in quiz.questions.all():
                question_id = str(question.id)
                correct_option = question.options.filter(is_correct=True).first()
                
                if correct_option:
                    correct_answers_data[question_id] = correct_option.id
                    if answers.get(question_id) == correct_option.id:
                        correct_answers += 1
            
            score_percentage = int((correct_answers / total_questions) * 100)
            passed = score_percentage >= quiz.min_score_percentage
            
            # Create attempt
            attempt = Attempt.objects.create(
                user=request.user,
                quiz=quiz,
                score=score_percentage,
                passed=passed,
                answers=answers
            )
            
            # Create certification if passed and doesn't exist
            certification = None
            if passed:
                certification, created = Certification.objects.get_or_create(
                    user=request.user,
                    quiz=quiz,
                    defaults={'obtained_date': timezone.now()}
                )
                # Generate PNG and PDF files for new certification
                if created:
                    print(f"Génération des fichiers pour certification {certification.id}")
                    files_generated = generate_certification_files(certification)
                    print(f"Fichiers générés: {files_generated}")
                    if not files_generated:
                        print("Erreur lors de la génération des fichiers de certification")
            
            # Calculate remaining attempts
            remaining_attempts = max(0, quiz.max_attempts - (attempt_count + 1))
            
            return Response({
                'attempt': AttemptResultSerializer(attempt).data,
                'correct_answers': correct_answers_data,
                'remaining_attempts': remaining_attempts,
                'certification_obtained': certification is not None
            }, status=status.HTTP_201_CREATED)
            
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)


# --- Certification Views ---
@extend_schema(
    tags=['Certifications'],
    summary='Lister mes attestations',
    description='Retourne la liste des attestations obtenues par l\'utilisateur connecté',
    responses={200: CertificationSerializer}
)
class CertificationListView(ListAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user).order_by('-obtained_date')


@extend_schema(
    tags=['Certifications'],
    summary='Télécharger une attestation en PNG',
    description='Télécharge le fichier PNG d\'une attestation spécifique',
    responses={
        200: {'type': 'string', 'format': 'binary', 'description': 'Fichier PNG de l\'attestation'}
    }
)
@api_view(['GET'])
@permission_classes([IsStudent])
def certification_png(request, certification_id):
    try:
        certification = Certification.objects.get(id=certification_id, user=request.user)
        if not certification.png_file:
            return Response({'error': 'Fichier PNG non disponible'}, status=status.HTTP_404_NOT_FOUND)
        
        response = HttpResponse(certification.png_file.read(), content_type='image/png')
        response['Content-Disposition'] = f'attachment; filename="certification_{certification.id}.png"'
        return response
    except Certification.DoesNotExist:
        return Response({'error': 'Attestation non trouvée'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Certifications'],
    summary='Télécharger une attestation en PDF',
    description='Télécharge le fichier PDF d\'une attestation spécifique',
    responses={
        200: {'type': 'string', 'format': 'binary', 'description': 'Fichier PDF de l\'attestation'}
    }
)
@api_view(['GET'])
@permission_classes([IsStudent])
def certification_pdf(request, certification_id):
    try:
        certification = Certification.objects.get(id=certification_id, user=request.user)
        if not certification.pdf_file:
            return Response({'error': 'Fichier PDF non disponible'}, status=status.HTTP_404_NOT_FOUND)
        
        response = HttpResponse(certification.pdf_file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certification_{certification.id}.pdf"'
        return response
    except Certification.DoesNotExist:
        return Response({'error': 'Attestation non trouvée'}, status=status.HTTP_404_NOT_FOUND)


# --- Admin Views ---
@extend_schema(
    tags=['Admin'],
    summary='Données de sécurité',
    description='Récupère les devices et IP pour la page de sécurité admin',
    responses={200: {'type': 'object'}}
)
@api_view(['GET'])
@permission_classes([IsAdmin])
def security_data(request):
    """Récupère les devices et IP pour la page de sécurité admin."""
    devices = Device.objects.all().select_related('user').order_by('-last_login')
    ips = IP.objects.all().select_related('user').order_by('-created_at')
    
    devices_data = []
    for device in devices:
        devices_data.append({
            'id': str(device.id),
            'user': device.user.email if device.user else 'Anonymous',
            'name': device.name,
            'device_type': device.device_type,
            'os': device.os,
            'browser': device.browser,
            'ip_address': device.ip_address,
            'location': device.location,
            'last_login': device.last_login.isoformat() if device.last_login else None,
            'active': device.active,
            'is_primary': device.is_primary,
            'user_agent': device.user_agent
        })
    
    ips_data = []
    for ip in ips:
        ips_data.append({
            'id': str(ip.id),
            'user': ip.user.email if ip.user else 'Anonymous',
            'ip': ip.ip,
            'created_at': ip.created_at.isoformat() if ip.created_at else None,
            'device_id': str(ip.device.id) if ip.device else None
        })
    
    return Response({
        'devices': devices_data,
        'ips': ips_data
    })


@extend_schema(
    tags=['Admin Portal'],
    summary='Statistiques de la plateforme',
    description='Retourne les statistiques globales de la plateforme',
    responses={200: StatsSerializer}
)
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    # Permission class already ensures only admins can access
    
    total_users = User.objects.filter(role='student').count()
    total_quizzes = Quiz.objects.count()
    total_attempts = Attempt.objects.count()
    total_certifications = Certification.objects.count()
    
    success_rate = 0
    if total_attempts > 0:
        passed_attempts = Attempt.objects.filter(passed=True).count()
        success_rate = round((passed_attempts / total_attempts) * 100, 2)
    
    # Calculate growth percentages (compare with 30 days ago)
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Count items created in the last 30 days
    users_last_30_days = User.objects.filter(role='student', created_at__gte=thirty_days_ago).count()
    quizzes_last_30_days = Quiz.objects.filter(created_at__gte=thirty_days_ago).count()
    attempts_last_30_days = Attempt.objects.filter(attempt_date__gte=thirty_days_ago).count()
    certifications_last_30_days = Certification.objects.filter(obtained_date__gte=thirty_days_ago).count()
    
    # Calculate growth percentages based on items created in last 30 days
    users_growth = 0
    if total_users > 0:
        users_growth = round((users_last_30_days / total_users) * 100, 1)
    
    quizzes_growth = 0
    if total_quizzes > 0:
        quizzes_growth = round((quizzes_last_30_days / total_quizzes) * 100, 1)
    
    attempts_growth = 0
    if total_attempts > 0:
        attempts_growth = round((attempts_last_30_days / total_attempts) * 100, 1)
    
    certifications_growth = 0
    if total_certifications > 0:
        certifications_growth = round((certifications_last_30_days / total_certifications) * 100, 1)
    
    data = {
        'total_users': total_users,
        'total_quizzes': total_quizzes,
        'total_attempts': total_attempts,
        'total_certifications': total_certifications,
        'success_rate': success_rate,
        'users_growth': users_growth,
        'quizzes_growth': quizzes_growth,
        'attempts_growth': attempts_growth,
        'certifications_growth': certifications_growth
    }
    
    serializer = StatsSerializer(data)
    return Response(serializer.data)


@extend_schema(
    tags=['Admin Portal'],
    summary='Activité récente',
    description='Retourne les dernières activités de la plateforme (certifications, quiz créés, utilisateurs inscrits)',
    responses={200: CertificationSerializer}
)
@api_view(['GET'])
@permission_classes([IsAdmin])
def recent_activity(request):
    # Permission class already ensures only admins can access

    # Get pagination parameters
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))

    activity_data = []

    # Get recent certifications
    recent_certifications = Certification.objects.select_related(
        'user', 'quiz'
    ).order_by('-obtained_date')

    for cert in recent_certifications:
        latest_attempt = Attempt.objects.filter(
            user=cert.user,
            quiz=cert.quiz
        ).order_by('-attempt_date').first()

        activity_data.append({
            'id': cert.id,
            'type': 'certification',
            'user_id': cert.user.id,
            'user_name': f"{cert.user.first_name} {cert.user.last_name}",
            'user_email': cert.user.email,
            'quiz_title': cert.quiz.title,
            'obtained_date': cert.obtained_date,
            'score': latest_attempt.score if latest_attempt else 0,
            'time_ago': calculate_time_ago(cert.obtained_date)
        })

    # Get recent quiz creations
    recent_quizzes = Quiz.objects.order_by('-created_at')
    for quiz in recent_quizzes:
        activity_data.append({
            'id': quiz.id,
            'type': 'quiz_created',
            'quiz_title': quiz.title,
            'quiz_category': quiz.category,
            'created_at': quiz.created_at,
            'time_ago': calculate_time_ago(quiz.created_at)
        })

    # Get recent user registrations
    recent_users = User.objects.filter(role='student').order_by('-created_at')
    for user in recent_users:
        activity_data.append({
            'id': user.id,
            'type': 'user_registered',
            'user_name': f"{user.first_name} {user.last_name}",
            'user_email': user.email,
            'created_at': user.created_at,
            'time_ago': calculate_time_ago(user.created_at)
        })

    # Get recent quiz attempts
    recent_attempts = Attempt.objects.select_related(
        'user', 'quiz'
    ).order_by('-attempt_date')
    for attempt in recent_attempts:
        activity_data.append({
            'id': attempt.id,
            'type': 'quiz_attempt',
            'user_name': f"{attempt.user.first_name} {attempt.user.last_name}",
            'user_email': attempt.user.email,
            'quiz_title': attempt.quiz.title,
            'score': attempt.score,
            'passed': attempt.passed,
            'attempt_date': attempt.attempt_date,
            'time_ago': calculate_time_ago(attempt.attempt_date)
        })

    # Get recent password reset requests
    recent_password_resets = User.objects.filter(
        reset_password_code_created_at__isnull=False
    ).order_by('-reset_password_code_created_at')
    for user in recent_password_resets:
        activity_data.append({
            'id': user.id,
            'type': 'password_reset',
            'user_name': f"{user.first_name} {user.last_name}",
            'user_email': user.email,
            'created_at': user.reset_password_code_created_at,
            'time_ago': calculate_time_ago(user.reset_password_code_created_at)
        })

    # Get recent email verifications
    recent_verifications = User.objects.filter(
        verification_code_created_at__isnull=False,
        is_verified=True
    ).order_by('-verification_code_created_at')
    for user in recent_verifications:
        activity_data.append({
            'id': user.id,
            'type': 'email_verified',
            'user_name': f"{user.first_name} {user.last_name}",
            'user_email': user.email,
            'created_at': user.verification_code_created_at,
            'time_ago': calculate_time_ago(user.verification_code_created_at)
        })

    # Sort all activities by date/time
    activity_data.sort(key=lambda x: x.get('obtained_date') or x.get('created_at') or x.get('attempt_date'), reverse=True)

    # Calculate pagination
    total_items = len(activity_data)
    total_pages = (total_items + page_size - 1) // page_size
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_data = activity_data[start_index:end_index]

    # Return paginated activities
    return Response({
        'results': paginated_data,
        'total': total_items,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages
    })


def calculate_time_ago(date):
    """Calculate human-readable time ago string"""
    from datetime import timedelta
    now = timezone.now()
    diff = now - date
    
    if diff < timedelta(minutes=1):
        return "À l'instant"
    elif diff < timedelta(hours=1):
        minutes = int(diff.total_seconds() / 60)
        return f"Il y a {minutes}m"
    elif diff < timedelta(days=1):
        hours = int(diff.total_seconds() / 3600)
        return f"Il y a {hours}h"
    elif diff < timedelta(days=7):
        days = diff.days
        return f"Il y a {days}j"
    else:
        weeks = diff.days // 7
        return f"Il y a {weeks} sem."


@extend_schema(
    tags=['Admin Portal'],
    summary='Lister les utilisateurs',
    description='Retourne la liste de tous les étudiants de la plateforme',
    responses={200: UserListSerializer}
)
class UserListView(ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAdmin]
    pagination_class = PageNumberPagination
    PageNumberPagination.page_size = 10

    def get_queryset(self):
        return User.objects.order_by('-created_at')


@extend_schema(
    tags=['Admin Portal'],
    summary='Créer un utilisateur',
    description='Crée un nouvel utilisateur étudiant',
    request=UserRegistrationSerializer,
    responses={201: UserListSerializer}
)
class UserCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserListSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Admin Portal'],
    summary='Mettre à jour un utilisateur',
    description='Met à jour les informations d\'un utilisateur',
    request=UserUpdateSerializer,
    responses={200: UserListSerializer}
)
class UserUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserListSerializer(user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Admin Portal'],
    summary='Supprimer un utilisateur',
    description='Supprime un utilisateur de la plateforme',
    responses={204: {'description': 'Utilisateur supprimé avec succès'}}
)
class UserDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Admin Portal'],
    summary='Lister les quiz (admin)',
    description='Retourne la liste de tous les quiz avec leurs statistiques',
    responses={200: QuizAdminSerializer}
)
class QuizAdminListView(ListAPIView):
    serializer_class = QuizAdminSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Quiz.objects.all().order_by('-created_at')


@extend_schema(
    tags=['Admin Portal'],
    summary='Créer un quiz',
    description='Crée un nouveau quiz avec ses questions et options',
    request=QuizCreateSerializer,
    responses={201: QuizAdminSerializer}
)
class QuizAdminCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        # Permission class already ensures only admins can access
        serializer = QuizCreateSerializer(data=request.data)
        if serializer.is_valid():
            quiz = serializer.save()
            return Response(QuizAdminSerializer(quiz).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Admin Portal'],
    summary='Gérer un quiz',
    description='Récupère, modifie ou supprime un quiz spécifique',
    responses={
        200: QuizAdminSerializer,
        204: {'description': 'Quiz supprimé avec succès'}
    }
)
class QuizAdminDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            serializer = QuizAdminSerializer(quiz)
            return Response(serializer.data)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            serializer = QuizAdminUpdateSerializer(quiz, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(QuizAdminSerializer(quiz).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            quiz.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)
recent_activity