from rest_framework import serializers
from .models import ScannerDevice, ScanSession, ScanEvent, MissingReport


class ScannerDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScannerDevice
        fields = ['id', 'device_id', 'name', 'mac_address', 'last_seen', 'is_online', 'created_at']


class ScanEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanEvent
        fields = ['rfid_tag', 'scanned_at', 'signal_strength', 'antenna_id']


class ScanSessionSerializer(serializers.ModelSerializer):
    shelf_code = serializers.CharField(source='shelf.code', read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = ScanSession
        fields = [
            'id', 'device', 'device_name', 'shelf', 'shelf_code',
            'started_at', 'ended_at', 'status',
            'total_tags_scanned', 'total_expected'
        ]


class MissingReportSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book_copy.book.title', read_only=True)
    shelf_code = serializers.CharField(source='expected_slot.shelf.code', read_only=True)
    rfid_tag = serializers.CharField(source='book_copy.rfid_tag', read_only=True)

    class Meta:
        model = MissingReport
        fields = [
            'id', 'session', 'book_copy', 'book_title', 'rfid_tag',
            'expected_slot', 'shelf_code', 'resolved_at',
            'notes', 'created_at'
        ]
