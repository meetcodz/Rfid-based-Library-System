from django.contrib import admin
from .models import ShelfAuditReport, Notification


@admin.register(ShelfAuditReport)
class ShelfAuditReportAdmin(admin.ModelAdmin):
    list_display = ['shelf', 'session', 'generated_at', 'missing_count', 'misplaced_count']
    list_filter = ['generated_at']
    raw_id_fields = ['shelf', 'session']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'type', 'title', 'read_at', 'created_at']
    list_filter = ['type', 'read_at', 'created_at']
    search_fields = ['title', 'message', 'recipient__username']
    raw_id_fields = ['recipient']
