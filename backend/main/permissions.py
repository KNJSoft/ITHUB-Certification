from rest_framework import permissions
from .models import UserRole

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN

class IsStudent(permissions.BasePermission):
    """
    Allows access only to student users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == UserRole.STUDENT

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to the resource owner or admin users.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read-only access for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Allow full access if the user is an admin
        if request.user.role == UserRole.ADMIN:
            return True

        # Allow access only if the user is the owner of the object
        # Handle different object types
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'id'):
            return obj == request.user
        return False

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows write access only to admin users, read access to any authenticated user.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN

class IsStudentOrAdmin(permissions.BasePermission):
    """
    Allows access to both students and admins (for general authenticated endpoints).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in [UserRole.STUDENT, UserRole.ADMIN]