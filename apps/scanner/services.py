"""
Scanner Services — Business logic for reconciling RFID scan data.
"""
from django.utils import timezone
from .models import ScanSession, ScanEvent, MissingReport
from apps.inventory.models import BookCopy, CopyStatus


def reconcile_scan_session(session_id):
    """
    Main logic for processing a completed scan session:
    1. Identify all unique RFID tags scanned.
    2. Get all book copies expected on this shelf (status='available').
    3. Find missing books (expected but NOT scanned).
    4. Find misplaced books (scanned but expected elsewhere).
    5. Update last_scanned_at and last_scanned_shelf for found books.
    """
    try:
        session = ScanSession.objects.select_related('shelf').get(id=session_id)
    except ScanSession.DoesNotExist:
        return None

    if session.status == ScanSession.Status.COMPLETED:
        return session

    # Get all unique RFID tags from events
    scanned_tags = set(session.events.values_list('rfid_tag', flat=True))
    session.total_tags_scanned = len(scanned_tags)

    # Get all copies expected to be on this shelf (status='available' and assigned to this shelf)
    expected_copies = BookCopy.objects.filter(
        assigned_shelf=session.shelf,
        status=CopyStatus.AVAILABLE,
        is_active=True
    ).select_related('assigned_shelf')
    session.total_expected = expected_copies.count()

    expected_rfids = {copy.rfid_tag: copy for copy in expected_copies}

    # 1. Process Scanned Tags
    for tag_id in scanned_tags:
        try:
            copy = BookCopy.objects.get(rfid_tag=tag_id, is_active=True)
            # Update last seen info
            copy.last_scanned_at = timezone.now()
            copy.last_scanned_shelf = session.shelf
            
            # If not assigned to this shelf, it's misplaced
            if copy.assigned_shelf and copy.assigned_shelf != session.shelf:
                copy.notes += f"\nDetected on shelf {session.shelf.code} during session {session.id} (Misplaced)."
            
            copy.save()
        except BookCopy.DoesNotExist:
            # New tag or unknown item
            pass

    # 2. Identify Missing Books
    missing_rfids = set(expected_rfids.keys()) - scanned_tags
    for missing_tag in missing_rfids:
        copy = expected_rfids[missing_tag]
        # Create a MissingReport if one doesn't already exist for this copy
        if not MissingReport.objects.filter(book_copy=copy, resolved_at__isnull=True).exists():
            MissingReport.objects.create(
                session=session,
                book_copy=copy,
                expected_shelf=copy.assigned_shelf,
                notes=f"Missing during shelf scan session {session.id}."
            )

    # Finalize session
    session.status = ScanSession.Status.COMPLETED
    session.ended_at = timezone.now()
    session.save()

    return session
