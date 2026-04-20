from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembershipTypeViewSet, MemberViewSet

router = DefaultRouter()
router.register('types', MembershipTypeViewSet, basename='membershiptype')
router.register('profiles', MemberViewSet, basename='member')

urlpatterns = [
    path('', include(router.urls)),
]
