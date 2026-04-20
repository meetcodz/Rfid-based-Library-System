"""
Celery application configuration for RFID Library System
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_system.settings.development')

app = Celery('library_system')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'calculate-fines-every-midnight': {
        'task': 'apps.circulation.tasks.calculate_daily_fines',
        'schedule': 86400.0,  # Once every 24 hours
    },
}
