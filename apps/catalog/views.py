from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Author, Publisher, Category, Book
from .serializers import (
    AuthorSerializer, PublisherSerializer,
    CategorySerializer, BookListSerializer, BookDetailSerializer
)


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.filter(is_active=True)
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.filter(is_active=True)
    serializer_class = PublisherSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city', 'country']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True, parent=None)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'language', 'published_year']
    search_fields = ['title', 'isbn', 'authors__name', 'description']
    ordering_fields = ['title', 'published_year', 'created_at']

    def get_queryset(self):
        return Book.objects.filter(is_active=True).select_related(
            'publisher', 'category'
        ).prefetch_related('authors')

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookDetailSerializer
