from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Section, Shelf, ShelfSlot, BookCopy, CopyStatus
from .serializers import (
    SectionSerializer, ShelfSerializer, ShelfSlotSerializer,
    BookCopySerializer, BookCopyDetailSerializer
)

class ShelfGridViewSet(viewsets.ViewSet):
    """
    Returns a grid representation of shelves and the books they contain.
    Used for the 'Live Tracking' visualization.
    """
    def list(self, request):
        shelves = Shelf.objects.select_related('section').filter(is_active=True)
        grid = []
        
        for shelf in shelves:
            # Get books that were last scanned in this shelf
            books_in_shelf = BookCopy.objects.filter(
                last_scanned_slot__shelf=shelf,
                is_active=True,
                status=CopyStatus.AVAILABLE
            ).values_list('book__title', flat=True)
            
            grid.append({
                'id': shelf.code,
                'row': shelf.row_number,
                'col': shelf.column_number,
                'section': shelf.section.name,
                'books': list(books_in_shelf)
            })
            
        return Response(grid)


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.filter(is_active=True)
    serializer_class = SectionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'floor']


class ShelfViewSet(viewsets.ModelViewSet):
    queryset = Shelf.objects.filter(is_active=True).select_related('section')
    serializer_class = ShelfSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['section', 'row_number']
    search_fields = ['code', 'label']

    @action(detail=True, methods=['get'], url_path='copies')
    def copies(self, request, pk=None):
        """Return all book copies currently assigned to this shelf."""
        shelf = self.get_object()
        copies = BookCopy.objects.filter(
            assigned_slot__shelf=shelf, is_active=True
        ).select_related('book', 'assigned_slot', 'last_scanned_slot')
        serializer = BookCopySerializer(copies, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='missing')
    def missing(self, request, pk=None):
        """Return unresolved missing reports for this shelf."""
        shelf = self.get_object()
        from apps.scanner.models import MissingReport
        reports = MissingReport.objects.filter(
            expected_slot__shelf=shelf,
            resolved_at__isnull=True
        ).select_related('book_copy__book', 'expected_slot')
        from apps.scanner.serializers import MissingReportSerializer
        serializer = MissingReportSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data)


class ShelfSlotViewSet(viewsets.ModelViewSet):
    queryset = ShelfSlot.objects.filter(is_active=True).select_related('shelf')
    serializer_class = ShelfSlotSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelf']


class BookCopyViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'condition', 'assigned_slot__shelf']
    search_fields = ['rfid_tag', 'barcode', 'accession_number', 'book__title', 'book__isbn']
    ordering_fields = ['status', 'created_at', 'last_scanned_at']

    def get_queryset(self):
        return BookCopy.objects.filter(is_active=True).select_related(
            'book', 'assigned_slot__shelf', 'last_scanned_slot__shelf'
        )

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return BookCopyDetailSerializer
        return BookCopySerializer

    @action(detail=False, methods=['get'], url_path='by-rfid/(?P<rfid_tag>[^/.]+)')
    def by_rfid(self, request, rfid_tag=None):
        """Look up a book copy directly by RFID tag — used by scanner firmware."""
        try:
            copy = BookCopy.objects.select_related(
                'book', 'assigned_slot__shelf', 'last_scanned_slot__shelf'
            ).get(rfid_tag=rfid_tag, is_active=True)
            return Response(BookCopyDetailSerializer(copy, context={'request': request}).data)
        except BookCopy.DoesNotExist:
            return Response({'detail': 'RFID tag not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='misplaced')
    def misplaced(self, request):
        """Return all copies that are in the wrong slot."""
        copies = [c for c in self.get_queryset() if c.is_misplaced]
        return Response(BookCopySerializer(copies, many=True, context={'request': request}).data)
