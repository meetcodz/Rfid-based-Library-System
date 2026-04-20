from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import MembershipType, Member
from .serializers import MembershipTypeSerializer, MemberSerializer, MemberDetailSerializer


class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.filter(is_active=True)
    serializer_class = MembershipTypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class MemberViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['membership_type', 'is_suspended']
    search_fields = ['member_id', 'user__username', 'user__first_name', 'user__last_name', 'phone']
    ordering_fields = ['created_at', 'membership_expiry']

    def get_queryset(self):
        return Member.objects.filter(is_active=True).select_related('user', 'membership_type')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return MemberDetailSerializer
        return MemberSerializer
