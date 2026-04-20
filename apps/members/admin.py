from django.contrib import admin
from .models import MembershipType, Member


@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_days', 'max_books_allowed', 'fine_per_day', 'is_active']
    search_fields = ['name']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_id', 'get_user_name', 'membership_type', 'membership_expiry', 'is_suspended', 'is_active']
    search_fields = ['member_id', 'user__username', 'user__first_name', 'user__last_name']
    list_filter = ['membership_type', 'is_suspended', 'is_active']
    raw_id_fields = ['user']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_user_name.short_description = 'User'
