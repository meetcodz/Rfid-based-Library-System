from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ScannerDevice, ScanSession, ScanEvent, MissingReport
from .serializers import (
    ScannerDeviceSerializer, ScanSessionSerializer,
    ScanEventSerializer, MissingReportSerializer
)
from .services import reconcile_scan_session


class ScannerDeviceViewSet(viewsets.ModelViewSet):
    queryset = ScannerDevice.objects.filter(is_active=True)
    serializer_class = ScannerDeviceSerializer

    @action(detail=True, methods=['post'], url_path='heartbeat')
    def heartbeat(self, request, pk=None):
        """Update device online status."""
        device = self.get_object()
        device.last_seen = timezone.now()
        device.is_online = True
        device.save()
        return Response({'status': 'online'})


class ScanSessionViewSet(viewsets.ModelViewSet):
    queryset = ScanSession.objects.select_related('device', 'shelf', 'operator').all()
    serializer_class = ScanSessionSerializer

    @action(detail=False, methods=['post'], url_path='start')
    def start_session(self, request):
        """Endpoint for scanner firmware to start a shelf scan."""
        device_id = request.data.get('device_id')
        shelf_id = request.data.get('shelf_id')
        
        try:
            device = ScannerDevice.objects.get(device_id=device_id, is_active=True)
        except ScannerDevice.DoesNotExist:
            return Response({'detail': f'Device {device_id} not registered.'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ScanSession.objects.create(
            device=device,
            shelf_id=shelf_id,
            operator=request.user if request.user.is_authenticated else None,
            status=ScanSession.Status.IN_PROGRESS
        )
        return Response(ScanSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='events')
    def upload_events(self, request, pk=None):
        """Bulk upload RFID tag detection events during a scan."""
        session = self.get_object()
        if session.status != ScanSession.Status.IN_PROGRESS:
            return Response({'detail': 'Session is not in progress.'}, status=status.HTTP_400_BAD_REQUEST)
        
        events_data = request.data.get('events', [])
        events = [
            ScanEvent(
                session=session,
                rfid_tag=item.get('rfid_tag'),
                signal_strength=item.get('signal_strength'),
                antenna_id=item.get('antenna_id', 1)
            ) for item in events_data
        ]
        ScanEvent.objects.bulk_create(events)
        return Response({'status': 'ok', 'count': len(events)})

    @action(detail=True, methods=['post'], url_path='end')
    def end_session(self, request, pk=None):
        """Finalize scan and trigger reconciliation logic."""
        session = self.get_object()
        if session.status != ScanSession.Status.IN_PROGRESS:
            return Response({'detail': 'Session is not in progress.'}, status=status.HTTP_400_BAD_REQUEST)

        # Trigger business logic service
        reconciled_session = reconcile_scan_session(session.id)
        return Response(ScanSessionSerializer(reconciled_session).data)


class MissingReportViewSet(viewsets.ModelViewSet):
    queryset = MissingReport.objects.select_related('book_copy__book', 'expected_slot__shelf').all()
    serializer_class = MissingReportSerializer

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        """Mark a missing book as found or officially lost."""
        report = self.get_object()
        report.resolved_at = timezone.now()
        report.resolved_by = request.user
        report.notes += f"\nResolved: {request.data.get('notes', '')}"
        report.save()
        return Response(MissingReportSerializer(report).data)
