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
    is_verified = models.BooleanField(default=False, verbose_name='Email vérifié')
    verification_code = models.CharField(max_length=6, null=True, blank=True, verbose_name='Code de vérification')
    verification_code_created_at = models.DateTimeField(null=True, blank=True, verbose_name='Date de création du code')
    reset_password_code = models.CharField(max_length=6, null=True, blank=True, verbose_name='Code de réinitialisation')
    reset_password_code_created_at = models.DateTimeField(null=True, blank=True, verbose_name='Date de création du code de réinitialisation')
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



class DeviceManager(models.Manager):
    """Gestionnaire personnalisé pour le modèle Device"""
    
    def get_user_devices(self, user):
        """Récupère tous les appareils d'un utilisateur"""
        return self.filter(user=user, active=True)
    
    def get_primary_device(self, user):
        """Récupère l'appareil principal d'un utilisateur"""
        return self.filter(user=user, is_primary=True, active=True).first()
        
    def get_or_create_for_request(self, request, user=None):
        """Obtient ou crée un appareil à partir de la requête"""
        return Device.create_from_request(request, user)
        
    def get_anonymous_devices(self, session_key):
        """Récupère les appareils anonymes pour une clé de session"""
        return self.filter(session_key=session_key, user__isnull=True, active=True)
        
    def transfer_to_user(self, devices, user):
        """Transfère des appareils anonymes à un utilisateur"""
        if not devices:
            return
            
        # Mettre à jour les appareils pour les associer à l'utilisateur
        updated = devices.update(
            user=user,
            session_key=None,  # Nettoyer la clé de session
            is_primary=not self.filter(user=user, is_primary=True).exists()  # Définir comme principal si premier appareil
        )
        
        # Si aucun appareil n'était principal, définir le premier comme principal
        if updated > 0 and not self.filter(user=user, is_primary=True).exists():
            first_device = self.filter(user=user).first()
            if first_device:
                first_device.is_primary = True
                first_device.save(update_fields=['is_primary'])
                
        return updated


class Device(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices', null=True, blank=True)
    session_key = models.CharField(max_length=40, blank=True, null=True, db_index=True,
                                 help_text="Session key for anonymous users")
    name = models.CharField(max_length=255, verbose_name="Nom de l'appareil")
    device_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="Type d'appareil")
    os = models.CharField(max_length=100, blank=True, null=True, verbose_name="Système d'exploitation")
    browser = models.CharField(max_length=100, blank=True, null=True, verbose_name="Navigateur")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="Adresse IP")
    user_agent = models.TextField(blank=True, null=True, verbose_name="User-Agent")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Localisation")
    is_primary = models.BooleanField(default=False, verbose_name="Appareil principal")
    active = models.BooleanField(default=True, verbose_name="Appareil actif")
    last_login = models.DateTimeField(auto_now=True, verbose_name="Dernière connexion")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    objects = DeviceManager()

    class Meta:
        verbose_name = "Appareil"
        verbose_name_plural = "Appareils"
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'is_primary'],
                condition=models.Q(is_primary=True, user__isnull=False),
                name='unique_primary_device_per_user'
            ),
            models.CheckConstraint(
                check=(
                    models.Q(user__isnull=False) | 
                    (models.Q(user__isnull=True) & ~models.Q(session_key__isnull=True))
                ),
                name='device_has_user_or_session'
            )
        ]
    
    def __str__(self):
        if self.user:
            return f"{self.name} ({self.device_type or 'Inconnu'}) - {self.user.email}"
        return f"{self.name} ({self.device_type or 'Inconnu'}) - Anonyme"
    
    def save(self, *args, **kwargs):
        # S'assurer qu'un seul appareil est marqué comme principal par utilisateur
        if self.is_primary and self.user:
            # Mettre à jour tous les autres appareils de l'utilisateur pour les marquer comme non principaux
            Device.objects.filter(user=self.user, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        
        # Si l'utilisateur est défini, s'assurer que la session_key est effacée
        if self.user_id and self.session_key:
            self.session_key = None
            
        super().save(*args, **kwargs)
        
        # Si c'est le seul appareil de l'utilisateur, le marquer comme principal
        if self.user and not self.is_primary and not Device.objects.filter(
            user=self.user, is_primary=True
        ).exclude(pk=self.pk).exists():
            self.is_primary = True
            self.save(update_fields=['is_primary'])
    
    def set_as_primary(self):
        """Définit cet appareil comme appareil principal"""
        if not self.user:
            return False
        self.is_primary = True
        self.save()
        return True
    
    def disconnect(self):
        """Déconnecte l'appareil (le marque comme inactif)"""
        self.active = False
        self.save(update_fields=['active'])
        return True

    # type device
    def get_device_type(self):
        if self.device_type == 'Ordinateur':
            return 'Ordinateur'
        elif self.device_type == 'Mobile':
            return 'Mobile'
        elif self.device_type == 'Tablette':
            return 'Tablette'
        else:
            return 'Inconnu'
    
    @classmethod
    def create_from_request(cls, request, user=None):
        """Crée un nouvel appareil à partir de la requête"""
        from user_agents import parse
        
        # Récupérer les informations de l'utilisateur
        user_agent_str = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(user_agent_str)
        
        # Récupérer l'adresse IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        # Créer un nom d'appareil lisible
        device_name = f"{user_agent.device.brand or 'Inconnu'} {user_agent.device.model or ''} ({user_agent.os.family})"
        device_name = device_name.strip()
        
        # Déterminer si c'est un utilisateur anonyme ou authentifié
        session_key = request.session.session_key if hasattr(request, 'session') else None
        
        # Vérifier si un appareil similaire existe déjà
        lookup = {
            'user_agent': user_agent_str[:255],
        }
        
        if user and user.is_authenticated:
            lookup['user'] = user
        elif session_key:
            lookup['session_key'] = session_key
            lookup['user__isnull'] = True
        else:
            # Impossible de créer un appareil sans utilisateur ni session
            return None
            
        device, created = cls.objects.get_or_create(
            **lookup,
            defaults={
                'name': device_name[:255],
                'device_type': user_agent.device.family,
                'os': f"{user_agent.os.family} {user_agent.os.version_string or ''}".strip(),
                'browser': f"{user_agent.browser.family} {user_agent.browser.version_string or ''}".strip(),
                'ip_address': ip,
                'session_key': session_key if not user or not user.is_authenticated else None,
                'is_primary': user and not cls.objects.filter(user=user, is_primary=True).exists()
            }
        )
        
        # Mettre à jour la dernière connexion
        if not created:
            update_fields = ['last_login']
            
            # Mettre à jour l'utilisateur si nécessaire (passage d'anonyme à connecté)
            if user and user.is_authenticated and (not device.user or device.user != user):
                device.user = user
                device.session_key = None  # Nettoyer la clé de session
                update_fields.extend(['user', 'session_key'])
                
                # Si c'est le premier appareil de l'utilisateur, le marquer comme principal
                if not cls.objects.filter(user=user, is_primary=True).exists():
                    device.is_primary = True
                    update_fields.append('is_primary')
            
            device.save(update_fields=update_fields)
        
        return device

class IP(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=generate_uuid_pk, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip = models.CharField(max_length=255, null=True, blank=True)
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True) # device
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "IP"
        verbose_name_plural = "IPs"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['ip']),
        ]
    
    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{self.ip} - {username}"
        # return f"{self.user} {self.ip}"