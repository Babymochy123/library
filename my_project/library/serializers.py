from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, BorrowRecord
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class BorrowRecordSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = BorrowRecord
        fields = ['id', 'user', 'book', 'book_title', 'issue_date', 'return_date', 'due_date', 'fine']
        read_only_fields = ['issue_date', 'due_date', 'fine', 'user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        return data

