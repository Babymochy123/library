from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from library.views import BookViewSet, BorrowRecordViewSet, SignUpView, AdminStatsView, UserManagementView
import rest_framework_simplejwt.views
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, BookListView, BorrowView, ReturnView, CustomTokenObtainPairView

# Create router for ViewSets
router = routers.DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'borrow', BorrowRecordViewSet, basename='borrow')

# Consolidated urlpatterns
urlpatterns = [
    # API routes with ViewSets
    path('api/', include(router.urls)),
    
    # Custom API endpoints
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/books-list/', BookListView.as_view(), name='book-list'),
    path('api/borrow/', BorrowView.as_view(), name='borrow'),
    path('api/return/', ReturnView.as_view(), name='return'),
    
    # JWT endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Sign up endpoint
    path('api/signup/', SignUpView.as_view(), name='signup'),
    
    # Admin endpoints
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('api/admin/users/', UserManagementView.as_view(), name='user_management'),
]
