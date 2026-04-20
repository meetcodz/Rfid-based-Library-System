from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScannerDeviceViewSet, ScanSessionViewSet, MissingReportViewSet
)

router = DefaultRouter()
router.register('devices', ScannerDeviceViewSet, basename='scannerdevice')
router.register('sessions', ScanSessionViewSet, basename='scansession')
router.register('missing-reports', MissingReportViewSet, basename='missingreport')

urlpatterns = [path('', include(router.urls))]
