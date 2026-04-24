"""library_system URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
import os

FRONTEND_DIR = os.path.join(settings.BASE_DIR, "smart-library-management (1)", "dist")

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Schema / Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App APIs
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/scanner/', include('apps.scanner.urls')),

    # Frontend Assets (Vite)
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(FRONTEND_DIR, 'assets')}),
    re_path(r'^(?P<path>.*\.ico|.*\.svg|.*\.txt)$', serve, {'document_root': FRONTEND_DIR}),

    # Frontend SPA (Catch-all)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    re_path(r'^(?!api|admin|static|media|assets).*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
