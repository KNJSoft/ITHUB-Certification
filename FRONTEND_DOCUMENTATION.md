# Documentation Frontend - IT HUB Certification Platform

## 🚀 Configuration de l'API

Le frontend est configuré pour communiquer avec le backend Django via l'URL : `http://127.0.0.1:8000/api/`

### Client API (`src/api/client.ts`)

Le client API utilise axios avec les fonctionnalités suivantes :

- **Base URL** : `http://127.0.0.1:8000/api/`
- **JWT Token Management** : Tokens stockés dans localStorage
- **Auto Refresh** : Rafraîchissement automatique du token d'accès
- **Error Handling** : Gestion automatique des erreurs 401

## 🔐 Authentification

### Services d'authentification (`src/api/services.ts`)

#### Login
```typescript
const response = await authService.login(email, password, isAdmin);
// Returns: { user, token }
```

#### Register
```typescript
const response = await authService.register({
  email,
  first_name,
  last_name,
  password,
  password_confirm,
  phone_number, // optionnel
  country,      // optionnel
  country_code  // optionnel
});
// Returns: { user, token }
```

#### Logout
```typescript
authService.logout();
```

#### Get Current User
```typescript
const user = await authService.getCurrentUser();
```

#### Refresh Token
```typescript
const newToken = await authService.refreshToken();
```

## 📚 Store d'Authentification (`src/store/authStore.ts`)

### Interface User
```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'student';
  profile_image?: string;
  profile_image_url?: string;
  phone_number?: string;
  country?: string;
  country_code?: string;
  created_at: string;
}
```

### Utilisation
```typescript
const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();

// Login
login(user, token);

// Logout
logout();

// Update user
updateUser({ profile_image_url: 'new_url' });
```

## 🎯 Services API

### Quiz Service
```typescript
// Lister les quiz disponibles
const quizzes = await quizService.getQuizzes();

// Détails d'un quiz
const quiz = await quizService.getQuizById(id);

// Soumettre une tentative
const result = await quizService.submitQuiz(quizId, answers);

// Admin: Créer un quiz
const newQuiz = await quizService.createQuiz(quizData);

// Admin: Mettre à jour un quiz
const updatedQuiz = await quizService.updateQuiz(id, quizData);

// Admin: Supprimer un quiz
await quizService.deleteQuiz(id);

// Admin: Lister tous les quiz
const allQuizzes = await quizService.getAdminQuizzes();
```

### Admin Service
```typescript
// Statistiques de la plateforme
const stats = await adminService.getStats();

// Lister les utilisateurs
const users = await adminService.getUsers();
```

### Student Service
```typescript
// Lister les attestations
const certifications = await studentService.getCertifications();

// Télécharger attestation PNG
const pngBlob = await studentService.downloadCertificationPNG(certificationId);

// Télécharger attestation PDF
const pdfBlob = await studentService.downloadCertificationPDF(certificationId);
```

## 📄 Composants d'Authentification

### Login (`src/pages/auth/Login.tsx`)

Le composant Login supporte deux modes :
- **Student Portal** : `/app/login`
- **Admin Portal** : `/admin/login`

Fonctionnalités :
- Formulaire email/password
- Gestion des erreurs
- Redirection automatique selon le rôle
- Lien vers Register (mode student uniquement)
- Switch entre portails

### Register (`src/pages/auth/Register.tsx`)

Champs disponibles :
- **Prénom** (requis)
- **Nom** (requis)
- **Email** (requis)
- **Numéro de téléphone** (optionnel)
- **Pays** (optionnel)
- **Code pays** (optionnel)
- **Mot de passe** (requis)
- **Confirmer mot de passe** (requis)

Fonctionnalités :
- Validation des mots de passe
- Gestion des erreurs
- Redirection vers Login après succès
- Design moderne avec TailwindCSS

## 🔧 Configuration

### Variables d'environnement

Pour changer l'URL de l'API backend, modifiez `src/api/client.ts` :

```typescript
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Changez cette URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### CORS Configuration

Le backend doit avoir CORS configuré pour autoriser le frontend :

```python
# backend/core/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
```

## 🧪 Tester la Liaison API

### 1. Démarrer le Backend
```bash
cd backend
python manage.py runserver
```

### 2. Démarrer le Frontend
```bash
npm run dev
```

### 3. Tester l'Inscription
1. Allez sur `http://localhost:5173/app/register`
2. Remplissez le formulaire
3. Vérifiez la réponse dans les DevTools (Network tab)
4. Vérifiez que les tokens sont stockés dans localStorage

### 4. Tester la Connexion
1. Allez sur `http://localhost:5173/app/login`
2. Connectez-vous avec les identifiants créés
3. Vérifiez la redirection vers le dashboard
4. Vérifiez que les tokens sont stockés

### 5. Tester les Quiz
1. Connectez-vous en tant qu'étudiant
2. Accédez au dashboard
3. Essayez de lister les quiz
4. Vérifiez les appels API dans les DevTools

## 📊 Structure du Projet

```
src/
├── api/
│   ├── client.ts          # Client API axios
│   ├── services.ts        # Services API (auth, quiz, admin, student)
│   └── mockData.ts        # Données mockées (déprécié)
├── components/
│   ├── Layout/
│   │   ├── StudentLayout.tsx
│   │   └── AdminLayout.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── student/
│   │   ├── Dashboard.tsx
│   │   ├── QuizPage.tsx
│   │   ├── QuizResult.tsx
│   │   ├── Certifications.tsx
│   │   └── Profile.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminQuizzes.tsx
│       ├── AdminUsers.tsx
│       └── Settings.tsx
├── store/
│   └── authStore.ts       # Store Zustand pour l'authentification
├── lib/
│   └── utils.ts           # Utilitaires (cn, etc.)
├── App.tsx                # Routes principales
└── main.tsx               # Point d'entrée
```

## 🐛 Débogage

### Vérifier les Tokens
```javascript
// Console du navigateur
console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('refresh_token'));
console.log(JSON.parse(localStorage.getItem('user')));
```

### Vérifier les Requêtes API
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Network
3. Filtrez par "XHR" ou "Fetch"
4. Vérifiez les requêtes vers `http://127.0.0.1:8000/api/`

### Erreurs Courantes

**CORS Error**
- Vérifiez la configuration CORS dans le backend
- Vérifiez que l'URL du frontend est dans CORS_ALLOWED_ORIGINS

**401 Unauthorized**
- Vérifiez que le token est stocké dans localStorage
- Vérifiez que le token n'est pas expiré
- Le client API devrait rafraîchir automatiquement le token

**404 Not Found**
- Vérifiez que l'URL de l'API est correcte
- Vérifiez que le backend est démarré
- Vérifiez les routes dans le backend

## 📝 Notes Importantes

1. **Tokens JWT** : Les tokens sont stockés dans localStorage pour le développement. Pour la production, utilisez des cookies httpOnly.

2. **Auto Refresh** : Le client API rafraîchit automatiquement le token d'accès lorsqu'il expire.

3. **Role-based Access** : Les routes sont protégées par le composant `ProtectedRoute` qui vérifie le rôle de l'utilisateur.

4. **Error Handling** : Tous les services API gèrent les erreurs et retournent des messages d'erreur français.

5. **TypeScript** : Le projet utilise TypeScript pour la sécurité des types. Assurez-vous que les interfaces correspondent aux réponses du backend.

## 🚀 Prochaines Étapes

1. Mettre à jour les composants du dashboard student pour utiliser les vraies données API
2. Mettre à jour les composants du dashboard admin pour utiliser les vraies données API
3. Implémenter le téléchargement des attestations (PNG/PDF)
4. Ajouter la gestion des erreurs globales
5. Implémenter le loading state global
6. Ajouter des tests E2E avec Playwright

## 📞 Support

Pour toute question sur l'intégration frontend-backend :
- Consultez la documentation backend : `backend/API_DOCUMENTATION.md`
- Consultez la documentation Swagger : `http://127.0.0.1:8000/api/docs/`
- Vérifiez les logs du backend pour les erreurs serveur
