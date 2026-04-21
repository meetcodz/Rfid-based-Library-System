"""
Inventory App — Physical locations (Sections, Shelves, Slots) 
and physical book copies with RFID tags.
"""
from django.db import models
from core.models import TimeStampedModel
from apps.catalog.models import Book


class CopyStatus(models.TextChoices):
    AVAILABLE   = 'available',   'Available'
    ISSUED      = 'issued',      'Issued'
    RESERVED    = 'reserved',    'Reserved'
    LOST        = 'lost',        'Lost'
    DAMAGED     = 'damaged',     'Damaged'
    IN_TRANSIT  = 'in_transit',  'In Transit'
    MAINTENANCE = 'maintenance', 'Under Maintenance'


class CopyCondition(models.TextChoices):
    NEW       = 'new',       'New'
    GOOD      = 'good',      'Good'
    FAIR      = 'fair',      'Fair'
    POOR      = 'poor',      'Poor'
    WITHDRAWN = 'withdrawn', 'Withdrawn'


class Section(TimeStampedModel):
    """
    A wing/section of the library building.
    e.g. "Science Wing, Floor 2"
    """
    name = models.CharField(max_length=150)
    floor = models.IntegerField(default=1)
    description = models.TextField(blank=True)

    def __str__(self):
        return f'{self.name} (Floor {self.floor})'

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Section'
        unique_together = [('name', 'floor')]


class Shelf(TimeStampedModel):
    """
    A physical shelf unit inside a section.
    Each shelf has a scanner assigned to it.
    """
    code = models.CharField(max_length=20, unique=True)   # e.g. "SH-A01"
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name='shelves'
    )
    row_number = models.PositiveIntegerField()
    column_number = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField(default=50)     # max books
    label = models.CharField(max_length=100, blank=True)   # Human-readable label
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'Shelf {self.code} — {self.section.name}'

    @property
    def current_book_count(self):
        return self.slots.filter(
            last_seen_copies__status=CopyStatus.AVAILABLE,
            last_seen_copies__is_active=True
        ).count()

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Shelf'
        verbose_name_plural = 'Shelves'
        indexes = [models.Index(fields=['code'])]


class ShelfSlot(TimeStampedModel):
    """
    An individual slot/position on a shelf.
    Each BookCopy's expected position in the library.
    """
    shelf = models.ForeignKey(
        Shelf, on_delete=models.CASCADE, related_name='slots'
    )
    slot_number = models.PositiveIntegerField()
    label = models.CharField(max_length=20, blank=True)    # e.g. "A01-3"

    def __str__(self):
        return f'Slot {self.label or self.slot_number} on {self.shelf.code}'

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Shelf Slot'
        unique_together = [('shelf', 'slot_number')]
        indexes = [models.Index(fields=['shelf', 'slot_number'])]


class BookCopy(TimeStampedModel):
    """
    A physical copy of a book, uniquely identified by its RFID tag.
    This is the central entity that the scanner interacts with.
    """
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name='copies'
    )
    rfid_tag = models.CharField(
        max_length=100, unique=True, db_index=True,
        help_text='Unique RFID tag hex ID attached to this copy'
    )
    barcode = models.CharField(max_length=100, blank=True, db_index=True)
    accession_number = models.CharField(
        max_length=50, unique=True,
        help_text='Library accession/catalog number'
    )
    acquisition_date = models.DateField(null=True, blank=True)
    condition = models.CharField(
        max_length=20, choices=CopyCondition.choices, default=CopyCondition.GOOD
    )
    status = models.CharField(
        max_length=20, choices=CopyStatus.choices, default=CopyStatus.AVAILABLE
    )
    # Where this copy should be (its home slot)
    assigned_slot = models.ForeignKey(
        ShelfSlot, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_copies',
        help_text='Expected home position of this copy on a shelf'
    )
    # Where this copy was actually last detected
    last_scanned_slot = models.ForeignKey(
        ShelfSlot, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='last_seen_copies',
        help_text='Last confirmed physical location from scanner'
    )
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'Copy of "{self.book.title}" [RFID: {self.rfid_tag}]'

    @property
    def is_available(self):
        return self.status == CopyStatus.AVAILABLE

    @property
    def is_misplaced(self):
        """True if the copy is available but found in a different slot."""
        return (
            self.status == CopyStatus.AVAILABLE
            and self.assigned_slot is not None
            and self.last_scanned_slot is not None
            and self.assigned_slot != self.last_scanned_slot
        )

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Book Copy'
        verbose_name_plural = 'Book Copies'
        indexes = [
            models.Index(fields=['rfid_tag']),
            models.Index(fields=['status']),
            models.Index(fields=['assigned_slot']),
            models.Index(fields=['barcode']),
        ]
