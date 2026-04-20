from rest_framework import serializers
from .models import IssueRecord, Reservation, Fine
from apps.inventory.serializers import BookCopySerializer
from apps.members.serializers import MemberSerializer


class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fine
        fields = ['id', 'amount', 'paid_at', 'payment_method', 'payment_reference']


class IssueRecordSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='copy.book.title', read_only=True)
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    fine = FineSerializer(read_only=True)

    class Meta:
        model = IssueRecord
        fields = [
            'id', 'copy', 'book_title', 'member', 'member_name',
            'issued_by', 'issued_at', 'due_date', 'returned_at',
            'status', 'fine', 'notes', 'created_at'
        ]


class IssueRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueRecord
        fields = ['copy', 'member', 'due_date', 'notes']

    def validate_copy(self, value):
        if value.status != 'available':
            raise serializers.ValidationError("This book copy is not available.")
        return value


class ReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'book', 'book_title', 'member', 'member_name',
            'reserved_at', 'expiry_date', 'is_fulfilled', 'status'
        ]
