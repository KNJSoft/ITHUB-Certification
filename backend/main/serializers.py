from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Quiz, Question, Option, Attempt, Certification


# --- User Serializers ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'country', 'country_code', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


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
        fields = ('id', 'text')


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'order', 'options')


class QuizListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'difficulty', 'trainer_name', 'timer_minutes')

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

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
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
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_image', 'profile_image_url', 'phone_number', 'country', 'country_code', 'role', 'created_at', 'certifications_count')

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

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'difficulty', 'trainer_name',
                 'timer_minutes', 'min_score_percentage', 'max_attempts', 'validity_hours',
                 'expiration_date', 'is_active', 'created_at', 'questions_count', 'attempts_count')

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_attempts_count(self, obj):
        return obj.attempts.count()


class StatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_quizzes = serializers.IntegerField()
    total_attempts = serializers.IntegerField()
    total_certifications = serializers.IntegerField()
    success_rate = serializers.FloatField()
