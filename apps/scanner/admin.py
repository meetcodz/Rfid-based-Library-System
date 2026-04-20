from django.contrib import admin
from .models import ScannerDevice, ScanSession, ScanEvent, MissingReport

@admin.register(ScannerDevice)
class ScannerDeviceAdmin(admin.ModelAdmin):
    list_display = ['name', 'device_id', 'last_seen', 'is_online', 'is_active']
    search_fields = ['name', 'device_id']

@admin.register(ScanSession)
class ScanSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'shelf', 'started_at', 'status', 'total_tags_scanned', 'total_expected']
    list_filter = ['status', 'started_at']
    raw_id_fields = ['device', 'shelf']

@admin.register(ScanEvent)
class ScanEventAdmin(admin.ModelAdmin):
    list_display = ['rfid_tag', 'session', 'scanned_at', 'antenna_id']
    list_filter = ['session']
    search_fields = ['rfid_tag']

@admin.register(MissingReport)
class MissingReportAdmin(admin.ModelAdmin):
    list_display = ['book_copy', 'expected_slot', 'session', 'resolved_at']
    list_filter = ['resolved_at']
    raw_id_fields = ['session', 'book_copy', 'expected_slot']
