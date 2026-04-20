from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionViewSet, ShelfViewSet, ShelfSlotViewSet, BookCopyViewSet, ShelfGridViewSet

router = DefaultRouter()
router.register('grid',     ShelfGridViewSet, basename='shelfgrid')
router.register('sections', SectionViewSet,   basename='section')
router.register('shelves',  ShelfViewSet,     basename='shelf')
router.register('slots',    ShelfSlotViewSet, basename='shelfslot')
router.register('copies',   BookCopyViewSet,  basename='bookcopy')

urlpatterns = [path('', include(router.urls))]
