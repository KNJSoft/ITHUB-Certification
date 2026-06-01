from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, Quiz, Question, Option, Attempt, Certification


# --- User Serializers ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'country', 'country_code', 'password', 'password_confirm', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'country', 'country_code', 'role', 'is_verified', 'is_active')


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Identifiants invalides.')
            if not user.is_active:
                raise serializers.ValidationError('Ce compte est désactivé.')
            attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_image', 'profile_image_url', 'phone_number', 'country', 'country_code', 'role', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'created_at')
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


# --- Quiz Serializers ---
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ('id', 'text', 'is_correct')


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'order', 'options')


class QuizListSerializer(serializers.ModelSerializer):
    attempts_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ('id','title', 'description', 'category', 'difficulty', 'trainer_name',
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'validity_hours', 'questions','expiration_date','is_active', 'attempts_count')

    def get_attempts_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.attempts.filter(user=request.user).count()
        return 0

    def to_representation(self, instance):
        # Only return active and non-expired quizzes
        if not instance.is_available:
            return None
        return super().to_representation(instance)


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'difficulty', 'trainer_name', 
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'questions')

    def to_representation(self, instance):
        # Only return active and non-expired quizzes
        if not instance.is_available:
            raise serializers.ValidationError("Ce quiz n'est pas disponible.")
        return super().to_representation(instance)


class QuizCreateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(write_only=True, min_length=1)

    class Meta:
        model = Quiz
        fields = ('title', 'description', 'category', 'difficulty', 'trainer_name',
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'validity_hours', 'questions')

    def validate_questions(self, value):
        if not value:
            raise serializers.ValidationError("Au moins une question est requise.")
        
        for question in value:
            if not question.get('text'):
                raise serializers.ValidationError("Chaque question doit avoir un texte.")
            
            if not question.get('options') or len(question['options']) < 2:
                raise serializers.ValidationError("Chaque question doit avoir au moins 2 options.")
            
            has_correct = False
            for option in question['options']:
                if not option.get('text'):
                    raise serializers.ValidationError("Chaque option doit avoir un texte.")
                if option.get('is_correct'):
                    has_correct = True
            
            if not has_correct:
                raise serializers.ValidationError("Chaque question doit avoir une réponse correcte.")
        
        return value

    def create(self, validated_data):
        from datetime import timedelta
        questions_data = validated_data.pop('questions')
        
        # Calculer la date d'expiration
        validity_hours = validated_data.get('validity_hours', 24)
        expiration_date = timezone.now() + timedelta(hours=validity_hours)
        validated_data['expiration_date'] = expiration_date
        
        quiz = Quiz.objects.create(**validated_data)
        
        for i, question_data in enumerate(questions_data, 1):
            options_data = question_data.pop('options')
            question = Question.objects.create(quiz=quiz, order=i, **question_data)
            
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)
        
        return quiz


# --- Attempt Serializers ---
class AttemptSubmitSerializer(serializers.Serializer):
    answers = serializers.JSONField()

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les réponses doivent être au format JSON.")
        return value


class AttemptResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    remaining_attempts = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = ('id', 'quiz', 'quiz_title', 'score', 'passed', 'attempt_date', 'remaining_attempts')

    def get_remaining_attempts(self, obj):
        total_attempts = Attempt.objects.filter(user=obj.user, quiz=obj.quiz).count()
        return max(0, obj.quiz.max_attempts - total_attempts)


# --- Certification Serializers ---
class CertificationSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = Certification
        fields = ('id', 'quiz', 'quiz_title', 'obtained_date', 'png_file', 'pdf_file')


# --- Admin Serializers ---
class UserListSerializer(serializers.ModelSerializer):
    certifications_count = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_image', 'profile_image_url', 'phone_number', 'country', 'country_code', 'role', 'created_at', 'certifications_count', 'is_verified', 'is_active')

    def get_certifications_count(self, obj):
        return obj.certifications.count()
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class QuizAdminSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'difficulty', 'trainer_name',
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'validity_hours',
                 'expiration_date', 'is_active', 'created_at', 'questions_count', 'attempts_count', 'questions')

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_attempts_count(self, obj):
        return obj.attempts.count()


class QuizAdminUpdateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = Quiz
        fields = ('title', 'description', 'category', 'difficulty', 'trainer_name',
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'validity_hours', 'questions')

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)

        # Mettre à jour les champs du quiz
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si des questions sont fournies, les mettre à jour
        if questions_data is not None:
            # Supprimer les questions existantes
            instance.questions.all().delete()

            # Créer les nouvelles questions
            for i, question_data in enumerate(questions_data, 1):
                options_data = question_data.pop('options', [])
                question_data.pop('order', None)  # Supprimer order si présent pour éviter le conflit
                question = Question.objects.create(quiz=instance, order=i, **question_data)

                for option_data in options_data:
                    Option.objects.create(question=question, **option_data)

        return instance


class StatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_quizzes = serializers.IntegerField()
    total_attempts = serializers.IntegerField()
    total_certifications = serializers.IntegerField()
    success_rate = serializers.FloatField()
    users_growth = serializers.FloatField()
    quizzes_growth = serializers.FloatField()
    attempts_growth = serializers.FloatField()
    certifications_growth = serializers.FloatField()
