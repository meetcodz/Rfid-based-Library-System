from rest_framework import serializers
from .models import Section, Shelf, BookCopy, CopyStatus
from apps.catalog.serializers import BookListSerializer


class SectionSerializer(serializers.ModelSerializer):
    shelf_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'name', 'floor', 'description', 'shelf_count']

    def get_shelf_count(self, obj):
        return obj.shelves.filter(is_active=True).count()


class ShelfSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)
    current_book_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Shelf
        fields = [
            'id', 'code', 'rfid_tag', 'section', 'section_name',
            'row_number', 'column_number', 'capacity',
            'label', 'notes', 'current_book_count'
        ]


class BookCopySerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn  = serializers.CharField(source='book.isbn',  read_only=True)
    shelf_code = serializers.CharField(source='assigned_shelf.code', read_only=True)
    is_misplaced = serializers.BooleanField(read_only=True)

    class Meta:
        model = BookCopy
        fields = [
            'id', 'book', 'book_title', 'book_isbn',
            'rfid_tag', 'barcode', 'accession_number',
            'acquisition_date', 'condition', 'status',
            'assigned_shelf', 'shelf_code',
            'last_scanned_shelf', 'last_scanned_at',
            'is_misplaced', 'notes',
            'created_at', 'updated_at',
        ]


class BookCopyDetailSerializer(BookCopySerializer):
    book = BookListSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        source='book',
        queryset=__import__('apps.catalog.models', fromlist=['Book']).Book.objects.all(),
        write_only=True
    )
    assigned_shelf_detail = ShelfSerializer(source='assigned_shelf', read_only=True)
    last_scanned_shelf_detail = ShelfSerializer(source='last_scanned_shelf', read_only=True)

    class Meta(BookCopySerializer.Meta):
        fields = BookCopySerializer.Meta.fields + [
            'book_id', 'assigned_shelf_detail', 'last_scanned_shelf_detail'
        ]
