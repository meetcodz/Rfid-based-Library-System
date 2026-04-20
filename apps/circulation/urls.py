from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueRecordViewSet, ReservationViewSet, FineViewSet

router = DefaultRouter()
router.register('issues', IssueRecordViewSet, basename='issuerecord')
router.register('reservations', ReservationViewSet, basename='reservation')
router.register('fines', FineViewSet, basename='fine')

urlpatterns = [path('', include(router.urls))]
