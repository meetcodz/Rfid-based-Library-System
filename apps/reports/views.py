from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from apps.circulation.models import IssueRecord
from apps.catalog.models import Book, Category
from .models import ShelfAuditReport, Notification
from .serializers import ShelfAuditReportSerializer, NotificationSerializer

class AnalyticsViewSet(viewsets.ViewSet):
    """
    Endpoints for dashboard charts and metrics.
    """
    def list(self, request):
        # 1. Total Stats
        total_books = Book.objects.filter(is_active=True).count()
        active_issues = IssueRecord.objects.filter(status='active').count()
        total_members = __import__('apps.members.models', fromlist=['Member']).Member.objects.filter(is_active=True).count()
        
        # 2. Genre Distribution (for Pie Chart)
        genre_dist = Category.objects.annotate(
            book_count=Count('books')
        ).values('name', 'book_count')
        
        # 3. Monthly Usage (simplified aggregation)
        # In a real app, this would use truncated dates
        usage_data = [
            {'month': 'Jan', 'checkouts': 120, 'returns': 110, 'searches': 350},
            {'month': 'Feb', 'checkouts': 150, 'returns': 140, 'searches': 400},
            {'month': 'Mar', 'checkouts': 180, 'returns': 160, 'searches': 450},
            {'month': 'Apr', 'checkouts': 210, 'returns': 190, 'searches': 500},
        ]

        return Response({
            'total_books': total_books,
            'active_issues': active_issues,
            'total_members': total_members,
            'genre_distribution': list(genre_dist),
            'usage_data': usage_data
        })


class ShelfAuditReportViewSet(viewsets.ModelViewSet):
    queryset = ShelfAuditReport.objects.select_related('shelf', 'session').all()
    serializer_class = ShelfAuditReportSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelf']


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'read_at']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all notifications for the current user as read."""
        self.get_queryset().filter(read_at__isnull=True).update(read_at=timezone.now())
        return Response({'status': 'all marked as read'})
