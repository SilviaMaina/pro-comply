from rest_framework import serializers
from .models import Engineer, UserProfile
from django.contrib.auth import authenticate


class EngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = ['id', 'email', 'first_name', 'last_name', 'ebk_registration_number', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    engineer_email = serializers.ReadOnlyField(source='engineer.email')    
    engineer_name = serializers.SerializerMethodField()
    engineer_id = serializers.ReadOnlyField(source='engineer.id')
    profile_photo_url = serializers.SerializerMethodField()
    
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
            'profile_photo_url',
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
        read_only_fields = ['id', 'engineer_id', 'created_at', 'updated_at', 'profile_photo_url']

    def get_engineer_name(self, obj):
        return f"{obj.engineer.first_name} {obj.engineer.last_name}"
    
    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            return obj.profile_photo.url
        return None
    
    def update(self, instance, validated_data):
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
        
        # Update UserProfile fields (including profile_photo if uploaded)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance