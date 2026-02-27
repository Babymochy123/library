from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from django.db import transaction
from django.contrib.auth.models import User
from .models import Book, BorrowRecord
from .serializers import BookSerializer, BorrowRecordSerializer, UserSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]


class BorrowRecordViewSet(viewsets.ModelViewSet):
    serializer_class = BorrowRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users see all records, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return BorrowRecord.objects.all()
        return BorrowRecord.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        requested_book = serializer.validated_data['book']

        with transaction.atomic():
            book = Book.objects.select_for_update().get(pk=requested_book.pk)
            if book.available_copies <= 0:
                return Response({'error': 'No copies available'}, status=status.HTTP_400_BAD_REQUEST)

            if BorrowRecord.objects.filter(
                user=request.user,
                book=book,
                return_date__isnull=True
            ).exists():
                return Response({'error': 'User already has an active borrow for this book'}, status=status.HTTP_400_BAD_REQUEST)

            borrow_record = BorrowRecord.objects.create(user=request.user, book=book)
            book.available_copies -= 1
            book.save(update_fields=['available_copies'])

        output = self.get_serializer(borrow_record)
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def issue_book(self, request, pk=None):
        borrow_record = self.get_object()
        if borrow_record.book.available_copies > 0:
            borrow_record.book.available_copies -= 1
            borrow_record.book.save()
            borrow_record.user = request.user
            borrow_record.save()
            return Response({'message': 'Book issued successfully'})
        else:
            return Response({'error': 'No copies available'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def issue_to_user(self, request):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        book_id = request.data.get('book_id')

        if not user_id or not book_id:
            return Response({'error': 'user_id and book_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            try:
                book = Book.objects.select_for_update().get(pk=book_id)
            except Book.DoesNotExist:
                return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

            if book.available_copies <= 0:
                return Response({'error': 'No copies available'}, status=status.HTTP_400_BAD_REQUEST)

            if BorrowRecord.objects.filter(
                user=target_user,
                book=book,
                return_date__isnull=True
            ).exists():
                return Response({'error': 'User already has an active borrow for this book'}, status=status.HTTP_400_BAD_REQUEST)

            borrow_record = BorrowRecord.objects.create(user=target_user, book=book)
            book.available_copies -= 1
            book.save(update_fields=['available_copies'])

        serializer = self.get_serializer(borrow_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        borrow_record = self.get_object()
        borrow_record.return_date = request.data.get('return_date')
        borrow_record.calculate_fine()
        borrow_record.save()
        borrow_record.book.available_copies += 1
        borrow_record.book.save()
        return Response({'fine': borrow_record.fine}, status=status.HTTP_200_OK)


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password or not email:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow admin users
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        total_books = Book.objects.count()
        total_users = User.objects.count()
        total_borrows = BorrowRecord.objects.count()
        active_borrows = BorrowRecord.objects.filter(return_date__isnull=True).count()
        overdue_borrows = BorrowRecord.objects.filter(
            return_date__isnull=True,
            due_date__lt=__import__('datetime').date.today()
        ).count()

        return Response({
            'total_books': total_books,
            'total_users': total_users,
            'total_borrows': total_borrows,
            'active_borrows': active_borrows,
            'overdue_borrows': overdue_borrows,
        })


class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow admin users
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().values('id', 'username', 'email', 'is_staff', 'is_superuser', 'is_active')
        return Response(list(users))

    def post(self, request):
        # Only allow admin users to create users
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        is_staff = request.data.get('is_staff', False)

        if not username or not password or not email:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email, is_staff=is_staff)
        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'is_staff': user.is_staff}, status=status.HTTP_201_CREATED)
