from django.db import models

# Create your models here.
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

# --- Helper function for UUID generation ---
# Define a named function to generate UUIDs, which Django can serialize.
def generate_uuid_pk():
    return str(uuid.uuid4())

# --- Rôles d'Utilisateur ---
# Nous allons utiliser une énumération pour les rôles afin de garantir la cohérence.
class UserRole(models.TextChoices):
    STUDENT = 'student', 'Student'
    ADMIN = 'admin', 'Admin'


# --- Custom User Manager (Optionnel mais recommandé pour AbstractUser) ---
# Ceci permet de gérer la création d'utilisateurs avec nos champs personnalisés.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)  # Admin par défaut
        extra_fields.setdefault('username', email)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# --- 1. User (Utilisateur) ---
class User(AbstractUser):
    # Utilise un UUID comme clé primaire
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    email = models.EmailField(unique=True, blank=False, null=False)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT  # Rôle par défaut
    )
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True, help_text="Photo de profil de l'utilisateur")
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Numéro de téléphone")
    country = models.CharField(max_length=100, blank=True, null=True, help_text="Pays de résidence")
    country_code = models.CharField(max_length=5, blank=True, null=True, help_text="Code pays (ex: FR, US, etc.)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # Pour activer/désactiver le compte
    is_staff = models.BooleanField(default=False)  # Si l'utilisateur peut accéder à l'interface d'administration

    # Indique que 'email' est utilisé comme champ d'identification unique
    USERNAME_FIELD = 'email'
    # 'username' et 'email' sont requis par défaut, mais nous utilisons 'email' pour la connexion.
    # Les champs listés ici seront demandés lors de la création d'un superutilisateur via createsuperuser.
    REQUIRED_FIELDS = []

    objects = CustomUserManager()  # Utilise notre gestionnaire d'utilisateurs personnalisé

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['country']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


# --- 2. Quiz ---
class Quiz(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    title = models.CharField(max_length=200, blank=False)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(
        max_length=20,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )
    trainer_name = models.CharField(max_length=150, blank=False)
    timer_minutes = models.PositiveIntegerField(default=30, help_text="Durée du quiz en minutes")
    min_score_percentage = models.PositiveIntegerField(default=80, help_text="Score minimum de réussite en pourcentage")
    max_attempts = models.PositiveIntegerField(default=2, help_text="Nombre maximum d'essais")
    validity_hours = models.PositiveIntegerField(default=24, help_text="Durée de validité en heures (24 ou 48)")
    expiration_date = models.DateTimeField(help_text="Date d'expiration calculée automatiquement")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Quiz"
        verbose_name_plural = "Quizzes"
        indexes = [
            models.Index(fields=['is_active', 'expiration_date']),
            models.Index(fields=['category']),
            models.Index(fields=['difficulty']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Calculer automatiquement la date d'expiration à la création
        if not self.id and not self.expiration_date:
            from datetime import timedelta
            self.expiration_date = timezone.now() + timedelta(hours=self.validity_hours)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expiration_date

    @property
    def is_available(self):
        return self.is_active and not self.is_expired


# --- 3. Question ---
class Question(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(blank=False)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ['order']
        indexes = [
            models.Index(fields=['quiz', 'order']),
        ]

    def __str__(self):
        return f"Question {self.order} of {self.quiz.title}"


# --- 4. Option ---
class Option(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.TextField(blank=False)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Option"
        verbose_name_plural = "Options"
        indexes = [
            models.Index(fields=['question']),
        ]

    def __str__(self):
        return f"Option for {self.question}"


# --- 5. Attempt (Tentative) ---
class Attempt(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0, help_text="Score obtenu en pourcentage")
    passed = models.BooleanField(default=False, help_text="Résultat : réussi ou échoué")
    attempt_date = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(default=dict, help_text="Réponses soumises au format JSON")

    class Meta:
        verbose_name = "Tentative"
        verbose_name_plural = "Tentatives"
        indexes = [
            models.Index(fields=['user', 'quiz']),
            models.Index(fields=['quiz', 'passed']),
            models.Index(fields=['attempt_date']),
        ]
        unique_together = ['user', 'quiz', 'attempt_date']  # Éviter les doublons de tentative

    def __str__(self):
        return f"Tentative de {self.user.email} pour {self.quiz.title}"


# --- 6. Certification (Attestation) ---
class Certification(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='certifications')
    obtained_date = models.DateTimeField(auto_now_add=True)
    png_file = models.ImageField(upload_to='media/badges/', blank=True, null=True)
    pdf_file = models.FileField(upload_to='media/badges/', blank=True, null=True)

    class Meta:
        verbose_name = "Attestation"
        verbose_name_plural = "Attestations"
        indexes = [
            models.Index(fields=['user', 'obtained_date']),
            models.Index(fields=['quiz']),
        ]
        unique_together = ['user', 'quiz']  # Un utilisateur ne peut avoir qu'une attestation par quiz

    def __str__(self):
        return f"Attestation de {self.user.email} pour {self.quiz.title}"

