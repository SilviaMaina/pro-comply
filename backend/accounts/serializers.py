from rest_framework import serializers
from.models import Engineer, UserProfile
from django.contrib.auth import authenticate

class EngineerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Engineer
        fields = ['email', 'first_name', 'last_name', 'ebk_registration_number', 'password', 'password2']
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data    


    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')


        engineer = Engineer.objects.create_user(
            password=password,
            **validated_data)
        return engineer
    
class EngineerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
     
    def validate(self, data):
        engineer = authenticate(email=data['email'], password=data['password'])
        if engineer is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not engineer.is_active:
            raise serializers.ValidationError("This account is inactive.")
        data['engineer'] = engineer
        return data
    
class UserProfileSerilizer(serializers.ModelSerializer):
    engineer_email = serializers.ReadOnlyField(source='engineer.email')    
    engineer_name = serializers.SerializerMethodField()
    pdu_units_remaining = serializers.ReadOnlyField()
    license_status =serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'engineer_email',
            'engineer_name',
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
        read_only_fields = ['id', 'created_at', 'updated_at' ]

    def get_engineer_name(self, obj):
        return f"{obj.engineer.first_name} {obj.engineer.last_name}"    

