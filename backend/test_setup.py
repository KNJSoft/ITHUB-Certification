#!/usr/bin/env python
"""
Test script to verify IT HUB platform setup
"""

import os
import sys
import django
from django.conf import settings

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        import django
        print(f"✅ Django {django.get_version()}")
    except ImportError:
        print("❌ Django not installed")
        return False
    
    try:
        import rest_framework
        print(f"✅ Django REST Framework {rest_framework.__version__}")
    except ImportError:
        print("❌ Django REST Framework not installed")
        return False
    
    try:
        import rest_framework_simplejwt
        print(f"✅ SimpleJWT installed")
    except ImportError:
        print("❌ SimpleJWT not installed")
        return False
    
    try:
        import corsheaders
        print(f"✅ CORS Headers installed")
    except ImportError:
        print("❌ CORS Headers not installed")
        return False
    
    try:
        from PIL import Image
        print(f"✅ Pillow installed")
    except ImportError:
        print("❌ Pillow not installed")
        return False
    
    try:
        from reportlab.pdfgen import canvas
        print(f"✅ ReportLab installed")
    except ImportError:
        print("❌ ReportLab not installed")
        return False
    
    return True

def test_django_setup():
    """Test Django configuration"""
    print("\n🔧 Testing Django setup...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False
    
    try:
        from main.models import User, Quiz, Question, Option, Attempt, Certification
        print("✅ Models imported successfully")
    except ImportError as e:
        print(f"❌ Model import failed: {e}")
        return False
    
    return True

def test_database():
    """Test database connection"""
    print("\n💾 Testing database connection...")
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_urls():
    """Test URL configuration"""
    print("\n🌐 Testing URL configuration...")
    
    try:
        from django.urls import reverse
        from django.test import Client
        
        # Test if URLs are properly configured
        client = Client()
        
        # Test admin URL
        try:
            response = client.get('/admin/')
            print("✅ Admin URL accessible")
        except:
            print("⚠️  Admin URL not accessible (may need login)")
        
        # Test API URL patterns
        try:
            from django.urls import get_resolver
            resolver = get_resolver()
            print("✅ URL patterns loaded")
        except Exception as e:
            print(f"❌ URL pattern error: {e}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ URL test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 IT HUB Platform Setup Verification")
    print("=" * 50)
    
    tests = [
        ("Dependencies", test_imports),
        ("Django Setup", test_django_setup),
        ("Database", test_database),
        ("URLs", test_urls),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        if test_func():
            passed += 1
            print(f"✅ {test_name} test passed")
        else:
            print(f"❌ {test_name} test failed")
    
    print(f"\n{'='*50}")
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Setup is complete.")
        print("\nNext steps:")
        print("1. Run: python manage.py migrate")
        print("2. Run: python manage.py createsuperuser")
        print("3. Run: python manage.py runserver")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
