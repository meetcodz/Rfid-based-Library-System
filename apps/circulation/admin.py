from django.contrib import admin
from .models import IssueRecord, Reservation, Fine


@admin.register(IssueRecord)
class IssueRecordAdmin(admin.ModelAdmin):
    list_display = ['copy', 'member', 'issued_at', 'due_date', 'returned_at', 'status']
    list_filter = ['status', 'issued_at', 'due_date']
    search_fields = ['copy__rfid_tag', 'copy__book__title', 'member__member_id']
    raw_id_fields = ['copy', 'member', 'issued_by']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['book', 'member', 'reserved_at', 'expiry_date', 'is_fulfilled', 'status']
    list_filter = ['status', 'is_fulfilled']
    raw_id_fields = ['book', 'member']


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ['issue_record', 'amount', 'paid_at', 'payment_method']
    list_filter = ['paid_at']
    raw_id_fields = ['issue_record']
