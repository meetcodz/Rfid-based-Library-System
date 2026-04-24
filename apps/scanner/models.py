"""
Scanner App — RFID hardware management, scan sessions, and missing book reports.
"""
from django.db import models
from django.contrib.auth.models import User
from core.models import TimeStampedModel
from apps.inventory.models import Shelf, BookCopy


class ScannerDevice(TimeStampedModel):
    device_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    mac_address = models.CharField(max_length=50, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.name} ({self.device_id})'


class ScanSession(TimeStampedModel):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED   = 'completed',   'Completed'
        FAILED      = 'failed',      'Failed'
        CANCELLED   = 'cancelled',   'Cancelled'

    device = models.ForeignKey(ScannerDevice, on_delete=models.CASCADE, related_name='sessions')
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, related_name='scan_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    total_tags_scanned = models.PositiveIntegerField(default=0)
    total_expected = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'Session {self.id} on {self.shelf.code}'


class ScanEvent(models.Model):
    """Raw RFID tag reads from a scanner session."""
    session = models.ForeignKey(ScanSession, on_delete=models.CASCADE, related_name='events')
    rfid_tag = models.CharField(max_length=100)
    scanned_at = models.DateTimeField(auto_now_add=True)
    signal_strength = models.FloatField(null=True, blank=True)
    antenna_id = models.IntegerField(default=1)

    class Meta:
        ordering = ['scanned_at']
        indexes = [
            models.Index(fields=['rfid_tag']),
        ]


class MissingReport(TimeStampedModel):
    """Automatically generated when a book expected on a shelf is not found."""
    session = models.ForeignKey(ScanSession, on_delete=models.CASCADE, related_name='missing_reports')
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name='missing_reports')
    expected_shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, null=True, blank=True, related_name='missing_reports')
    resolved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'Missing: {self.book_copy.book.title} (RFID: {self.book_copy.rfid_tag})'

    @property
    def is_resolved(self):
        return self.resolved_at is not None
