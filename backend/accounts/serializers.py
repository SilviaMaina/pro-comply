from rest_framework import serializers
from .models import Engineer, UserProfile
from django.contrib.auth import authenticate

class EngineerSerializer(serializers.ModelSerializer):
    """Serializer for Engineer (auth user) model"""
    class Meta:
        model = Engineer
        fields = ['id', 'email', 'first_name', 'last_name', 'ebk_registration_number', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']  # Email shouldn't be changed after registration


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile (extended info) model"""
    engineer_email = serializers.ReadOnlyField(source='engineer.email')    
    engineer_name = serializers.SerializerMethodField()
    engineer_id = serializers.ReadOnlyField(source='engineer.id')
    
    # Include Engineer editable fields
    first_name = serializers.CharField(source='engineer.first_name', required=False)
    last_name = serializers.CharField(source='engineer.last_name', required=False)
    ebk_registration_number = serializers.CharField(source='engineer.ebk_registration_number', required=False)
    
    pdu_units_remaining = serializers.ReadOnlyField()
    license_status = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'engineer_id',
            'engineer_email',
            'engineer_name',
            # Engineer fields (editable)
            'first_name',
            'last_name',
            'ebk_registration_number',
            # Profile fields
            'profile_photo',
            'engineering_specialization',
            'phone_number',
            'national_id',
            'license_expiry_date',
            'pdu_units_earned',
            'pdu_units_required',
            'pdu_units_remaining',
            'license_status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'engineer_id', 'created_at', 'updated_at']

    def get_engineer_name(self, obj):
        return f"{obj.engineer.first_name} {obj.engineer.last_name}"
    
    def update(self, instance, validated_data):
        """Update both Engineer and UserProfile fields"""
        # Extract Engineer fields if present
        engineer_data = {}
        if 'engineer' in validated_data:
            engineer_data = validated_data.pop('engineer')
        
        # Update Engineer fields
        if engineer_data:
            engineer = instance.engineer
            for attr, value in engineer_data.items():
                setattr(engineer, attr, value)
            engineer.save()
        
        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance