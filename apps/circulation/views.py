from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import IssueRecord, Reservation, Fine
from .serializers import (
    IssueRecordSerializer, IssueRecordCreateSerializer,
    ReservationSerializer, FineSerializer
)
from apps.inventory.models import BookCopy, CopyStatus


class IssueRecordViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'member', 'copy__assigned_slot__shelf']
    search_fields = ['copy__rfid_tag', 'copy__book__title', 'member__member_id']
    ordering_fields = ['issued_at', 'due_date']

    def get_queryset(self):
        return IssueRecord.objects.select_related(
            'copy__book', 'member__user', 'issued_by'
        ).all()

    def get_serializer_class(self):
        if self.action == 'create':
            return IssueRecordCreateSerializer
        return IssueRecordSerializer

    def perform_create(self, serializer):
        # Create issue record and update copy status
        issue = serializer.save(issued_by=self.request.user)
        copy = issue.copy
        copy.status = CopyStatus.ISSUED
        copy.save()

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        """Handle returning a book and potentially calculating fines."""
        issue = self.get_object()
        if issue.status == 'returned':
            return Response({'detail': 'Book already returned.'}, status=status.HTTP_400_BAD_CONTENT)

        now = timezone.now()
        issue.returned_at = now
        issue.status = 'returned'
        issue.save()

        # Update book copy
        copy = issue.copy
        copy.status = CopyStatus.AVAILABLE
        # Set last scanned slot to null until next shelf scan or manual placement
        copy.save()

        # Check for fine (trivially simplified for now, usually a celery task)
        if now > issue.due_date:
            days_overdue = (now - issue.due_date).days
            if days_overdue > 0:
                fine_rate = issue.member.membership_type.fine_per_day
                amount = days_overdue * fine_rate
                Fine.objects.create(issue_record=issue, amount=amount)

        return Response(IssueRecordSerializer(issue).data)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('book', 'member__user').all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'member']


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.select_related('issue_record__member__user').all()
    serializer_class = FineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['paid_at']
