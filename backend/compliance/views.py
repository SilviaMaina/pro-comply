from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum, Case, When, IntegerField
from .models import CPDActivity
from .serializers import CPDActivitySerializer

# Create your views here.

class CPDActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = CPDActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CPDActivity.objects.filter(engineer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(engineer=self.request.user)


class CPDActivityDetailView(generics.RetrieveAPIView):
    queryset = CPDActivity.objects.all()
    serializer_class = CPDActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CPDActivity.objects.filter(engineer=self.request.user)

class CPDSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import date
        year = request.query_params.get('year', date.today().year)
        engineer = request.user

        # Total PDUs
        total_pdus = CPDActivity.objects.filter(
            engineer=engineer,
            date_completed__year=year,
            status='APPROVED'
        ).aggregate(total=Sum('pdu_units_awarded'))['total'] or 0

        # Breakdown by category
        category_breakdown = {}
        for code, label in CPDActivity.ACTIVITY_TYPE_CHOICES:
            pdus = CPDActivity.objects.filter(
                engineer=engineer,
                activity_type=code,
                date_completed__year=year,
                status='APPROVED'
            ).aggregate(total=Sum('pdu_units_awarded'))['total'] or 0
            category_breakdown[code] = pdus

        # Limits per category (from EBK policy)
        MAX_PDUS_PER_CATEGORY = {
            'EBK_ORGANIZED': 10,
            'PARTICIPATION': 5,
            'PRESENTATION': 10,
            'KNOWLEDGE_CONTRIBUTION': 10,
            'WORK_BASED': 10,
            'INFORMAL': 10,
            'ACCREDITED_PROVIDER': 25,
        }

        # Calculate remaining per category
        remaining_by_category = {
            cat: max(0, MAX_PDUS_PER_CATEGORY.get(cat, 10) - earned)
            for cat, earned in category_breakdown.items()
        }

        # Overall progress
        total_required = 50
        total_remaining = max(0, total_required - total_pdus)

        return Response({
            'year': year,
            'total_pdus_earned': total_pdus,
            'total_pdus_required': total_required,
            'total_pdus_remaining': total_remaining,
            'breakdown_by_category': {
                cat: {
                    'earned': category_breakdown[cat],
                    'remaining': remaining_by_category[cat],
                    'limit': MAX_PDUS_PER_CATEGORY.get(cat, 10)
                }
                for cat in category_breakdown
            }
        })