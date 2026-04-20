from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, ShelfAuditReportViewSet, NotificationViewSet

router = DefaultRouter()
router.register('analytics', AnalyticsViewSet, basename='analytics')
router.register('audits', ShelfAuditReportViewSet, basename='shelfauditreport')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = [path('', include(router.urls))]
