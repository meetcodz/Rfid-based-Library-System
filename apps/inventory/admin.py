from django.contrib import admin
from .models import Section, Shelf, ShelfSlot, BookCopy


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'floor', 'is_active']
    search_fields = ['name']
    list_filter = ['floor', 'is_active']


@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ['code', 'section', 'row_number', 'column_number', 'capacity', 'is_active']
    search_fields = ['code', 'label']
    list_filter = ['section', 'is_active']


@admin.register(ShelfSlot)
class ShelfSlotAdmin(admin.ModelAdmin):
    list_display = ['label', 'shelf', 'slot_number']
    list_filter = ['shelf__section']
    search_fields = ['label', 'shelf__code']


@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = [
        'accession_number', 'book', 'rfid_tag',
        'status', 'condition', 'assigned_slot', 'last_scanned_at'
    ]
    search_fields = ['rfid_tag', 'barcode', 'accession_number', 'book__title']
    list_filter = ['status', 'condition', 'is_active']
    readonly_fields = ['last_scanned_at', 'last_scanned_slot', 'created_at', 'updated_at']
    raw_id_fields = ['book', 'assigned_slot', 'last_scanned_slot']
