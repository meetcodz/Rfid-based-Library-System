"""
Catalog App — Book metadata: Authors, Publishers, Categories, Books
"""
from django.db import models
from core.models import TimeStampedModel


class Author(TimeStampedModel):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='authors/', null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Author'
        verbose_name_plural = 'Authors'


class Publisher(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Publisher'


class Category(TimeStampedModel):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    # Self-referential for sub-categories (e.g., Science > Physics)
    parent = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='subcategories'
    )

    def __str__(self):
        if self.parent:
            return f'{self.parent.name} > {self.name}'
        return self.name

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'


class Book(TimeStampedModel):
    """
    Represents a book title (not a physical copy).
    Physical copies are tracked in the inventory app as BookCopy.
    """
    isbn = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True)
    authors = models.ManyToManyField(Author, related_name='books', blank=True)
    publisher = models.ForeignKey(
        Publisher, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='books'
    )
    category = models.ForeignKey(
        Category, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='books'
    )
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    total_pages = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(max_length=50, default='English')
    edition = models.CharField(max_length=50, blank=True)
    published_year = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f'{self.title} (ISBN: {self.isbn})'

    @property
    def available_copies_count(self):
        return self.copies.filter(status='available', is_active=True).count()

    @property
    def total_copies_count(self):
        return self.copies.filter(is_active=True).count()

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Book'
        indexes = [
            models.Index(fields=['isbn']),
            models.Index(fields=['title']),
        ]
