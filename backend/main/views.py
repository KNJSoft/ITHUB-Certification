from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models import Count, Q
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import User, Quiz, Question, Option, Attempt, Certification
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
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        if serializer.is_valid():
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

    activity_data = []

    # Get recent certifications
    recent_certifications = Certification.objects.select_related(
        'user', 'quiz'
    ).order_by('-obtained_date')[:5]

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
    recent_quizzes = Quiz.objects.order_by('-created_at')[:5]
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
    recent_users = User.objects.filter(role='student').order_by('-created_at')[:5]
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
    ).order_by('-attempt_date')[:5]
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

    # Sort all activities by date/time
    activity_data.sort(key=lambda x: x.get('obtained_date') or x.get('created_at') or x.get('attempt_date'), reverse=True)

    # Return only the 10 most recent activities
    return Response(activity_data[:10])


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
