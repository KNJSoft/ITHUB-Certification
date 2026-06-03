# Documentation de l'API IT HUB Certification Platform

## 📚 Accès à la Documentation

L'API dispose d'une documentation interactive avec Swagger et ReDoc :

### Swagger UI (Recommandé)
- **URL**: `http://127.0.0.1:8000/api/docs/`
- **Description**: Interface interactive pour tester les endpoints
- **Fonctionnalités**: 
  - Test direct des endpoints
  - Authentification persistante
  - Exemples de requêtes/réponses
  - Téléchargement des schémas

### ReDoc
- **URL**: `http://127.0.0.1:8000/api/redoc/`
- **Description**: Documentation statique élégante
- **Fonctionnalités**:
  - Format de documentation professionnelle
  - Navigation facile
  - Code d'exemple

### Schéma OpenAPI
- **URL**: `http://127.0.0.1:8000/api/schema/`
- **Format**: JSON/OpenAPI 3.0
- **Usage**: Pour intégration avec d'autres outils

## 🔐 Authentification dans Swagger

### 1. Créer un compte
```bash
POST /api/auth/register/
{
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123",
    "password_confirm": "SecurePassword123"
}
```

### 2. Se connecter
```bash
POST /api/auth/login/
{
    "email": "student@example.com",
    "password": "SecurePassword123"
}
```

### 3. Utiliser le token dans Swagger
1. Cliquez sur le bouton **"Authorize"** en haut à droite
2. Dans la boîte de dialogue, entrez : `Bearer VOTRE_ACCESS_TOKEN`
3. Cliquez sur **"Authorize"**
4. Le token sera automatiquement inclus dans toutes les requêtes

## 📋 Tags et Endpoints

### Authentication
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion  
- `POST /api/auth/token/refresh/` - Rafraîchir token
- `GET /api/auth/me/` - Profil utilisateur

### Student Portal
- `GET /api/quizzes/` - Lister les quiz disponibles
- `GET /api/quizzes/{id}/` - Détails d'un quiz
- `POST /api/quizzes/{id}/attempt/` - Soumettre une tentative

### Certifications
- `GET /api/certifications/` - Lister mes attestations
- `GET /api/certifications/{id}/png/` - Télécharger PNG
- `GET /api/certifications/{id}/pdf/` - Télécharger PDF

### Admin Portal
- `GET /api/admin/stats/` - Statistiques plateforme
- `GET /api/admin/users/` - Lister les utilisateurs
- `GET /api/admin/quizzes/` - Lister tous les quiz
- `POST /api/admin/quizzes/create/` - Créer un quiz
- `GET /api/admin/quizzes/{id}/` - Détails quiz admin
- `PUT /api/admin/quizzes/{id}/` - Modifier quiz
- `DELETE /api/admin/quizzes/{id}/` - Supprimer quiz

## 🎯 Exemples d'Utilisation

### Créer un Quiz (Admin)
```json
POST /api/admin/quizzes/create/
{
    "title": "Introduction à Python",
    "description": "Quiz sur les bases de Python",
    "category": "Programmation",
    "difficulty": "beginner",
    "trainer_name": "Jean Dupont",
    "timer_minutes": 30,
    "min_score_percentage": 80,
    "max_attempts": 2,
    "validity_hours": 24,
    "questions": [
        {
            "text": "Qu'est-ce qu'une variable en Python ?",
            "order": 1,
            "options": [
                {"text": "Un conteneur de données", "is_correct": true},
                {"text": "Une fonction", "is_correct": false},
                {"text": "Une boucle", "is_correct": false},
                {"text": "Une classe", "is_correct": false}
            ]
        }
    ]
}
```

### Soumettre une Tentative (Student)
```json
POST /api/quizzes/{quiz_id}/attempt/
{
    "answers": {
        "question_id_1": "option_id_1",
        "question_id_2": "option_id_3"
    }
}
```

### Réponse Attendue
```json
{
    "attempt": {
        "id": "uuid",
        "quiz": "quiz_uuid",
        "quiz_title": "Introduction à Python",
        "score": 85,
        "passed": true,
        "attempt_date": "2024-01-15T10:30:00Z",
        "remaining_attempts": 1
    },
    "correct_answers": {
        "question_id_1": "option_id_1",
        "question_id_2": "option_id_2"
    },
    "remaining_attempts": 1,
    "certification_obtained": true
}
```

## 🔍 Codes d'Erreur

### 400 Bad Request
- Données invalides ou manquantes
- Quiz expiré ou non disponible
- Nombre maximum de tentatives atteint

### 401 Unauthorized
- Token invalide ou expiré
- Non authentifié

### 403 Forbidden
- Accès non autorisé (mauvais rôle)
- Admin essayant de passer un quiz

### 404 Not Found
- Quiz ou utilisateur non trouvé
- Attestation non trouvée

## 🛠️ Configuration Développement

Pour activer la documentation en développement :

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'drf_spectacular',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'IT HUB Certification Platform API',
    'DESCRIPTION': 'API pour la plateforme de micro-certification IT HUB',
    'VERSION': '1.0.0',
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
}
```

## 📱 Tests avec Swagger

1. **Naviguez** vers `http://127.0.0.1:8000/api/docs/`
2. **Authentifiez-vous** avec le bouton "Authorize"
3. **Explorez** les endpoints par tag
4. **Testez** directement depuis l'interface
5. **Vérifiez** les réponses et codes d'erreur

## 🚀 Production

En production, vous pouvez :
- Restreindre l'accès à la documentation
- Utiliser des variables d'environnement
- Personnaliser le branding Swagger
- Activer HTTPS obligatoire

## 📞 Support

Pour toute question sur l'API ou la documentation :
- Consultez d'abord la documentation Swagger
- Vérifiez les codes d'erreur ci-dessus
- Contactez l'équipe de développement si nécessaire
