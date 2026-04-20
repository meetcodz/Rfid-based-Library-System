from rest_framework import serializers
from .models import ShelfAuditReport, Notification


class ShelfAuditReportSerializer(serializers.ModelSerializer):
    shelf_code = serializers.CharField(source='shelf.code', read_only=True)

    class Meta:
        model = ShelfAuditReport
        fields = [
            'id', 'shelf', 'shelf_code', 'session',
            'generated_at', 'missing_count', 'misplaced_count', 'pdf_report'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'type', 'title', 'message',
            'read_at', 'related_id', 'created_at', 'is_read'
        ]
