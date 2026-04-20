from rest_framework import serializers
from .models import Author, Publisher, Category, Book


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'bio', 'photo', 'created_at']


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ['id', 'name', 'city', 'country', 'website']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.filter(is_active=True), many=True).data


class BookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    authors = AuthorSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    available_copies = serializers.IntegerField(source='available_copies_count', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'subtitle', 'authors',
            'category_name', 'cover_image', 'language',
            'edition', 'published_year', 'available_copies',
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    """Full serializer for create/retrieve."""
    authors = AuthorSerializer(many=True, read_only=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Author.objects.all(),
        source='authors', write_only=True
    )
    publisher = PublisherSerializer(read_only=True)
    publisher_id = serializers.PrimaryKeyRelatedField(
        queryset=Publisher.objects.all(),
        source='publisher', write_only=True, required=False
    )
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category', write_only=True, required=False
    )
    available_copies = serializers.IntegerField(source='available_copies_count', read_only=True)
    total_copies = serializers.IntegerField(source='total_copies_count', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'subtitle',
            'authors', 'author_ids',
            'publisher', 'publisher_id',
            'category', 'category_id',
            'cover_image', 'total_pages', 'language',
            'edition', 'published_year', 'description',
            'available_copies', 'total_copies',
            'created_at', 'updated_at',
        ]
