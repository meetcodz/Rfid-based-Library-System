from celery import shared_task
from django.utils import timezone
from .models import IssueRecord, IssueStatus, Fine


@shared_task
def calculate_daily_fines():
    """
    Periodic task to check for overdue books and calculate fines.
    Runs daily via Celery Beat.
    """
    now = timezone.now()
    # Find active issues that are past their due date
    overdue_issues = IssueRecord.objects.filter(
        status=IssueStatus.ACTIVE,
        due_date__lt=now
    ).select_related('member__membership_type')

    count = 0
    for issue in overdue_issues:
        # Calculate days overdue
        delta = now - issue.due_date
        days = delta.days
        
        if days > 0:
            fine_amount = days * issue.member.membership_type.fine_per_day
            
            # Update or create Fine
            fine, created = Fine.objects.update_or_create(
                issue_record=issue,
                defaults={'amount': fine_amount}
            )
            
            # Optionally update issue status if it wasn't already marked overdue
            if issue.status != IssueStatus.OVERDUE:
                issue.status = IssueStatus.OVERDUE
                issue.save(update_fields=['status'])
            
            count += 1

    return f"Calculated fines for {count} overdue records."
