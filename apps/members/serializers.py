from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MembershipType, Member


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = [
            'id', 'name', 'duration_days', 'max_books_allowed',
            'fine_per_day', 'can_reserve', 'description'
        ]


class MemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    membership_type_name = serializers.CharField(source='membership_type.name', read_only=True)
    active_issues = serializers.IntegerField(source='active_issues_count', read_only=True)
    outstanding_fine = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'user', 'member_id', 'membership_type', 'membership_type_name',
            'phone', 'address', 'profile_photo', 'date_of_birth',
            'membership_start', 'membership_expiry', 'is_suspended',
            'active_issues', 'outstanding_fine', 'created_at'
        ]


class MemberDetailSerializer(MemberSerializer):
    can_borrow = serializers.BooleanField(read_only=True)

    class Meta(MemberSerializer.Meta):
        fields = MemberSerializer.Meta.fields + ['can_borrow', 'suspension_reason']
