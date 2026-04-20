"""
Circulation App — Issue, Return, Reservations, and Fines.
"""
from django.db import models
from django.contrib.auth.models import User
from core.models import TimeStampedModel
from apps.inventory.models import BookCopy, CopyStatus
from apps.members.models import Member


class IssueStatus(models.TextChoices):
    ACTIVE   = 'active',   'Active'
    RETURNED = 'returned', 'Returned'
    OVERDUE  = 'overdue',  'Overdue'
    LOST     = 'lost',     'Lost'


class IssueRecord(TimeStampedModel):
    copy = models.ForeignKey(
        BookCopy, on_delete=models.CASCADE, related_name='issue_records'
    )
    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name='issue_records'
    )
    issued_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='issued_records'
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=IssueStatus.choices, default=IssueStatus.ACTIVE
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.copy.book.title} issued to {self.member.member_id}'

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Issue Record'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]


class Reservation(TimeStampedModel):
    book = models.ForeignKey(
        'catalog.Book', on_delete=models.CASCADE, related_name='reservations'
    )
    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name='reservations'
    )
    reserved_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_fulfilled = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f'Reservation for {self.book.title} by {self.member.member_id}'


class Fine(TimeStampedModel):
    issue_record = models.OneToOneField(
        IssueRecord, on_delete=models.CASCADE, related_name='fine'
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f'Fine of {self.amount} for {self.issue_record}'
