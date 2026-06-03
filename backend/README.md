# IT HUB Certification Platform - Backend

Backend API for the IT HUB micro-certification platform.

## 🚀 Features

- **Authentication**: JWT-based authentication with student/admin roles
- **Quiz Management**: Create, manage, and take quizzes with timer functionality
- **Certification**: Automatic generation of PNG and PDF certificates
- **Admin Panel**: Complete admin interface for platform management
- **Role-based Access**: Separate portals for students and administrators

## 📋 Requirements

- Python 3.11+
- Django 4.2+
- PostgreSQL (recommended) or SQLite for development

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd backend
python setup.py
```

### 2. Manual Setup (if setup.py fails)

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 3. Start Development Server

```bash
python manage.py runserver
```

## � Documentation API

### Swagger UI (Interactive)
- **URL**: `http://127.0.0.1:8000/api/docs/`
- Interface interactive pour tester tous les endpoints
- Authentification intégrée avec JWT
- Exemples de requêtes/réponses

### ReDoc (Documentation Statique)
- **URL**: `http://127.0.0.1:8000/api/redoc/`
- Documentation professionnelle et élégante
- Facile à naviguer

### OpenAPI Schema
- **URL**: `http://127.0.0.1:8000/api/schema/`
- Format JSON pour intégration externe

## �📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user profile

### Student Portal
- `GET /api/quizzes/` - List available quizzes
- `GET /api/quizzes/{id}/` - Get quiz details
- `POST /api/quizzes/{id}/attempt/` - Submit quiz attempt
- `GET /api/certifications/` - List user certifications
- `GET /api/certifications/{id}/png/` - Download certificate (PNG)
- `GET /api/certifications/{id}/pdf/` - Download certificate (PDF)

### Admin Portal
- `GET /api/admin/stats/` - Platform statistics
- `GET /api/admin/users/` - List all users
- `GET /api/admin/quizzes/` - List all quizzes
- `POST /api/admin/quizzes/create/` - Create new quiz
- `GET /api/admin/quizzes/{id}/` - Get quiz details
- `PUT /api/admin/quizzes/{id}/` - Update quiz
- `DELETE /api/admin/quizzes/{id}/` - Delete quiz

> 📖 **Documentation complète**: Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour des exemples détaillés et guides d'utilisation.

## 🏗️ Project Structure

```
backend/
├── core/                  # Django project settings
│   ├── settings.py       # Main configuration
│   ├── urls.py          # Root URL configuration
│   └── wsgi.py         # WSGI configuration
├── main/                # Main application
│   ├── models.py        # Database models
│   ├── views.py         # API views
│   ├── serializers.py   # DRF serializers
│   ├── urls.py          # App URL configuration
│   ├── admin.py         # Django admin configuration
│   └── utils.py        # Certificate generation utilities
├── media/               # Media files (certificates)
├── requirements.txt     # Python dependencies
└── setup.py           # Setup script
```

## 🎯 Business Rules

### Quiz Rules
- Quizzes are only visible if **active** AND **not expired**
- Maximum **2 attempts** per student per quiz
- Minimum **80% score** required for certification
- Quiz validity: **24h or 48h** after creation
- **Admins cannot take quizzes**

### Certification Rules
- Generated automatically when score ≥ 80%
- One certificate per user per quiz
- Available in PNG and PDF formats
- Includes student name, quiz title, date, and trainer name

### Access Control
- **Students**: Can only access student portal
- **Admins**: Can only access admin portal
- **Role separation**: No cross-access between portals

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL recommended)
DB_NAME=ithub_certification
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

### Database Setup

#### PostgreSQL (Recommended)
```sql
CREATE DATABASE ithub_certification;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE ithub_certification TO your_db_user;
```

#### SQLite (Development)
Default configuration uses SQLite for development.

## 📝 API Usage Examples

### Registration
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword",
    "password_confirm": "securepassword"
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepassword"
  }'
```

### Submit Quiz Attempt
```bash
curl -X POST http://127.0.0.1:8000/api/quizzes/{quiz_id}/attempt/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "question_id_1": "option_id_2",
      "question_id_2": "option_id_1"
    }
  }'
```

## 🔒 Security Features

- JWT authentication with 30-minute access tokens
- 7-day refresh tokens with rotation
- CORS protection for frontend integration
- Password validation
- Role-based access control
- SQL injection protection (Django ORM)

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test main

# Create test data
python manage.py loaddata fixtures/test_data.json
```

## 📊 Admin Panel

Access the Django admin panel at `http://127.0.0.1:8000/admin/`

Features:
- User management
- Quiz creation and editing
- Question and option management
- View attempts and certifications
- Platform statistics

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure production database
- [ ] Set up proper `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up static files serving
- [ ] Configure HTTPS
- [ ] Set up database backups
- [ ] Monitor and logging

## 🤝 Contributing

1. Work on the `backend/dev` branch
2. Push after completing each priority level
3. Test thoroughly before pushing
4. Follow the coding standards

## 📞 Support

For any issues or questions, please contact the development team.
