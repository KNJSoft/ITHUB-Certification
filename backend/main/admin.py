from django.contrib import admin
from .models import User, Quiz, Question, Option, Attempt, Certification


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'country', 'country_code', 'profile_image')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si c'est un nouvel utilisateur
            obj.set_password(obj.password)
        else:
            # Si c'est une modification, ne changer le mot de passe que s'il a été modifié
            if 'password' in form.changed_data:
                obj.set_password(obj.password)
        super().save_model(request, obj, form, change)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer_name', 'category', 'difficulty', 'is_active', 'expiration_date', 'created_at')
    list_filter = ('category', 'difficulty', 'is_active', 'created_at')
    search_fields = ('title', 'trainer_name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'order', 'created_at')
    list_filter = ('quiz', 'created_at')
    search_fields = ('text', 'quiz__title')
    ordering = ('quiz', 'order')


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct', 'created_at')
    list_filter = ('is_correct', 'created_at')
    search_fields = ('text', 'question__text')


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'passed', 'attempt_date')
    list_filter = ('passed', 'attempt_date', 'quiz')
    search_fields = ('user__email', 'quiz__title')
    ordering = ('-attempt_date',)
    readonly_fields = ('id', 'attempt_date')


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'obtained_date', 'png_file', 'pdf_file')
    list_filter = ('obtained_date', 'quiz')
    search_fields = ('user__email', 'quiz__title')
    ordering = ('-obtained_date',)
    readonly_fields = ('id', 'obtained_date')
