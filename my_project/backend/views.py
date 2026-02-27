# Backend views - imports from library app
from library.views import (
    BookViewSet,
    BorrowRecordViewSet,
    SignUpView,
    AdminStatsView,
    UserManagementView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from library.serializers import CustomTokenObtainPairSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from library.models import Book, BorrowRecord
from library.serializers import BookSerializer, BorrowRecordSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Additional views needed for the API
class RegisterView(APIView):
    permission_classes = []  # Allow any
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if not username or not password or not email:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password, email=email)
        return Response({'id': user.id, 'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)


class BookListView(APIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)


class BorrowView(APIView):
    def post(self, request):
        book_id = request.data.get('book_id')
        if not book_id:
            return Response({'error': 'book_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if book.available_copies <= 0:
            return Response({'error': 'No copies available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create borrow record
        borrow_record = BorrowRecord.objects.create(
            user=request.user,
            book=book
        )
        
        # Update available copies
        book.available_copies -= 1
        book.save()
        
        serializer = BorrowRecordSerializer(borrow_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReturnView(APIView):
    def post(self, request):
        borrow_id = request.data.get('borrow_id')
        return_date = request.data.get('return_date')
        
        if not borrow_id:
            return Response({'error': 'borrow_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            borrow_record = BorrowRecord.objects.get(id=borrow_id, user=request.user)
        except BorrowRecord.DoesNotExist:
            return Response({'error': 'Borrow record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if borrow_record.return_date:
            return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update return date and calculate fine
        from datetime import datetime
        if return_date:
            borrow_record.return_date = datetime.strptime(return_date, '%Y-%m-%d').date()
        else:
            borrow_record.return_date = datetime.now().date()
        
        borrow_record.calculate_fine()
        borrow_record.save()
        
        # Update available copies
        borrow_record.book.available_copies += 1
        borrow_record.book.save()
        
        return Response({
            'message': 'Book returned successfully',
            'fine': float(borrow_record.fine)
        }, status=status.HTTP_200_OK)
