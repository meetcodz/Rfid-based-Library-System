from django.contrib import admin
from .models import Section, Shelf, BookCopy


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'floor', 'is_active']
    search_fields = ['name']
    list_filter = ['floor', 'is_active']


@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ['code', 'rfid_tag', 'section', 'row_number', 'column_number', 'capacity', 'is_active']
    search_fields = ['code', 'rfid_tag', 'label']
    list_filter = ['section', 'is_active']


@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = [
        'accession_number', 'book', 'rfid_tag',
        'status', 'condition', 'assigned_shelf', 'last_scanned_at'
    ]
    search_fields = ['rfid_tag', 'barcode', 'accession_number', 'book__title']
    list_filter = ['status', 'condition', 'is_active']
    list_editable = ['assigned_shelf']
    readonly_fields = ['last_scanned_at', 'last_scanned_shelf', 'created_at', 'updated_at']
    
    # Use autocomplete for book lookup, but a simple dropdown for shelf selection
    autocomplete_fields = ['book']
    raw_id_fields = ['last_scanned_shelf']
