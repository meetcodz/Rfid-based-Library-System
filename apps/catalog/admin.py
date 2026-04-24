from django.contrib import admin
from .models import Author, Publisher, Category, Book
from apps.inventory.models import BookCopy


class BookCopyInline(admin.TabularInline):
    model = BookCopy
    extra = 1
    fields = ['rfid_tag', 'accession_number', 'status', 'assigned_shelf']


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'is_active']
    search_fields = ['name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active']
    search_fields = ['name']
    list_filter = ['parent']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'isbn', 'category', 'language', 'available_copies_count', 'is_active']
    search_fields = ['title', 'isbn', 'authors__name']
    list_filter = ['category', 'language', 'is_active']
    filter_horizontal = ['authors']
    inlines = [BookCopyInline]
    readonly_fields = ['created_at', 'updated_at']
