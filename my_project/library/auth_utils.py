from django.conf import settings


def is_permanent_admin(user):
    if not user or not user.is_authenticated:
        return False
    return user.username == getattr(settings, 'PERMANENT_ADMIN_USERNAME', 'yusra')
