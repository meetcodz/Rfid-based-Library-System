"""
Members App — Library members, membership types, user management.
"""
from django.db import models
from django.contrib.auth.models import User
from core.models import TimeStampedModel


class MembershipType(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)   # e.g. "Student", "Faculty"
    duration_days = models.PositiveIntegerField(default=365)
    max_books_allowed = models.PositiveIntegerField(default=3)
    fine_per_day = models.DecimalField(max_digits=6, decimal_places=2, default=2.00)
    can_reserve = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Membership Type'


class Member(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    member_id = models.CharField(max_length=20, unique=True, db_index=True)
    membership_type = models.ForeignKey(
        MembershipType, on_delete=models.PROTECT, related_name='members'
    )
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to='member_photos/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    membership_start = models.DateField(auto_now_add=True)
    membership_expiry = models.DateField(null=True, blank=True)
    is_suspended = models.BooleanField(default=False)
    suspension_reason = models.TextField(blank=True)

    def __str__(self):
        return f'{self.member_id} — {self.user.get_full_name() or self.user.username}'

    @property
    def active_issues_count(self):
        return self.issue_records.filter(status='active').count()

    @property
    def can_borrow(self):
        if self.is_suspended:
            return False
        return self.active_issues_count < self.membership_type.max_books_allowed

    @property
    def outstanding_fine(self):
        from django.db.models import Sum
        total = self.issue_records.filter(
            fine__paid_at__isnull=True
        ).aggregate(total=Sum('fine__amount'))['total']
        return total or 0

    class Meta(TimeStampedModel.Meta):
        verbose_name = 'Member'
        indexes = [models.Index(fields=['member_id'])]
