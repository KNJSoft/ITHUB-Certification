"""#!/usr/bin/env python

#Setup script for IT HUB Certification Platform Backend


import os
import sys
import subprocess

def run_command(command, description):
    #Run a command and handle errors
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    #Main setup process
    print("🚀 IT HUB Certification Platform Backend Setup")
    print("=" * 50)
    
    # Check if virtual environment exists
    venv_path = ".venv"
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        if not run_command("python -m venv .venv", "Create virtual environment"):
            return False
    
    # Install dependencies
    print("\nInstalling dependencies...")
    if not run_command("pip install -r requirements.txt", "Install dependencies"):
        print("⚠️  Dependency installation failed. You may need to install manually.")
        print("Try running: pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow reportlab")
    
    # Create migrations
    print("\nCreating database migrations...")
    if not run_command("python manage.py makemigrations", "Create migrations"):
        return False
    
    # Apply migrations
    print("\nApplying database migrations...")
    if not run_command("python manage.py migrate", "Apply migrations"):
        return False
    
    # Create superuser (optional)
    print("\n" + "="*50)
    print("Setup complete! 🎉")
    print("\nNext steps:")
    print("1. Start the development server: python manage.py runserver")
    print("2. Create a superuser: python manage.py createsuperuser")
    print("3. Access admin panel: http://127.0.0.1:8000/admin/")
    print("4. API documentation: http://127.0.0.1:8000/api/")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
"""