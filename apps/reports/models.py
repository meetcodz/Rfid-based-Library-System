"""
Reports App — Aggregated reports, audit logs, and notifications.
"""
from django.db import models
from django.contrib.auth.models import User
from core.models import TimeStampedModel
from apps.inventory.models import Shelf


class ShelfAuditReport(TimeStampedModel):
    """A formal report generated from a scan session."""
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, related_name='audit_reports')
    session = models.OneToOneField('scanner.ScanSession', on_delete=models.CASCADE, related_name='audit_report')
    generated_at = models.DateTimeField(auto_now_add=True)
    missing_count = models.PositiveIntegerField()
    misplaced_count = models.PositiveIntegerField()
    pdf_report = models.FileField(upload_to='reports/audits/', null=True, blank=True)

    def __str__(self):
        return f"Audit Report: {self.shelf.code} - {self.generated_at.date()}"


class Notification(TimeStampedModel):
    """System-wide notifications for users/librarians."""
    class Type(models.TextChoices):
        MISSING_BOOK = 'missing_book', 'Missing Book Alert'
        OVERDUE      = 'overdue',      'Overdue Book'
        SYSTEM       = 'system',       'System Message'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)
    # Generic relation helper
    related_id = models.UUIDField(null=True, blank=True)

    def __str__(self):
        return f"{self.type}: {self.title}"

    @property
    def is_read(self):
        return self.read_at is not None
