from rest_framework import serializers
from .models import CPDActivity

class CPDActivitySerializer(serializers.ModelSerializer):
    engineer_email = serializers.ReadOnlyField(source='engineer.email')
    engineer_name = serializers.SerializerMethodField()
    supporting_document_url = serializers.SerializerMethodField()

    class Meta:
        model = CPDActivity
        fields = [
            'id', 'engineer_email', 'engineer_name', 'title', 'description',
            'activity_type', 'date_completed', 'hours_spent',
            'supporting_document', 'supporting_document_url',
            'pdu_units_awarded', 'status', 'rejection_reason', 'created_at'
        ]
        read_only_fields = [
            'id', 'engineer_email', 'engineer_name', 'pdu_units_awarded',
            'status', 'rejection_reason', 'supporting_document_url'
        ]

    def get_engineer_name(self, obj):
        return f"{obj.engineer.first_name} {obj.engineer.last_name}"

    def get_supporting_document_url(self, obj):
        if obj.supporting_document:
            return obj.supporting_document.url
        return None

    def validate_date_completed(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value