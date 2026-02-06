from django.urls import path
from .views import (
    CPDActivityListCreateView, 
    CPDActivityDetailView, 
    CPDSummaryView,
    generate_cpd_report
)

urlpatterns = [ 
    path('cpd-activities/', CPDActivityListCreateView.as_view(), name='cpd-activity-list-create'),
    path('cpd-activities/<int:pk>/', CPDActivityDetailView.as_view(), name='cpd-activity-detail'),
    path('cpd-summary/', CPDSummaryView.as_view(), name='cpd-summary'),
    path('cpd-report/', generate_cpd_report, name='cpd-report'),
]