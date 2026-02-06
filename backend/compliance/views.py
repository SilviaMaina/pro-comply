from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from .models import CPDActivity
from .serializers import CPDActivitySerializer
from datetime import date
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

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

        # Limits per category
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def generate_cpd_report(request):
    """Generate PDF report of CPD activities"""
    year = request.query_params.get('year', date.today().year)
    engineer = request.user
    
    # Get activities
    activities = CPDActivity.objects.filter(
        engineer=engineer,
        date_completed__year=year,
        status='APPROVED'
    ).order_by('date_completed')
    
    # Calculate totals
    total_pdus = activities.aggregate(total=Sum('pdu_units_awarded'))['total'] or 0
    total_hours = activities.aggregate(total=Sum('hours_spent'))['total'] or 0
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    elements.append(Paragraph('CPD Activities Report', title_style))
    elements.append(Spacer(1, 12))
    
    # Engineer info
    info_data = [
        ['Engineer:', f"{engineer.first_name} {engineer.last_name}"],
        ['Email:', engineer.email],
        ['EBK Registration:', engineer.ebk_registration_number or 'N/A'],
        ['Report Year:', str(year)],
        ['Generated:', date.today().strftime('%B %d, %Y')]
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    # Summary
    summary_style = styles['Heading2']
    elements.append(Paragraph('Summary', summary_style))
    elements.append(Spacer(1, 12))
    
    summary_data = [
        ['Total PDUs Earned:', str(total_pdus)],
        ['Total Hours:', str(total_hours)],
        ['Total Activities:', str(activities.count())],
        ['PDUs Remaining:', str(max(0, 50 - total_pdus))]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EEF2FF')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#4F46E5'))
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Activities table
    elements.append(Paragraph('Activities Detail', summary_style))
    elements.append(Spacer(1, 12))
    
    if activities.exists():
        activity_data = [['Date', 'Title', 'Type', 'Hours', 'PDUs']]
        
        for activity in activities:
            activity_data.append([
                activity.date_completed.strftime('%Y-%m-%d'),
                Paragraph(activity.title[:40], styles['Normal']),
                dict(CPDActivity.ACTIVITY_TYPE_CHOICES).get(activity.activity_type, '')[:20],
                str(activity.hours_spent),
                str(activity.pdu_units_awarded)
            ])
        
        activity_table = Table(activity_data, colWidths=[1*inch, 2.5*inch, 1.5*inch, 0.7*inch, 0.7*inch])
        activity_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(activity_table)
    else:
        elements.append(Paragraph('No activities recorded for this year.', styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    # Return PDF
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="CPD_Report_{year}_{engineer.last_name}.pdf"'
    
    return response