from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AuctionEvent, AuctionItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class AuctionEventSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AuctionEvent
        fields = [
            'id',
            'name',
            'city',
            'state',
            'zip_code',
            'start_datetime',
            'end_datetime',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'is_active',
            'items_count',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def validate(self, data):
        if 'start_datetime' in data and 'end_datetime' in data:
            if data['end_datetime'] <= data['start_datetime']:
                raise serializers.ValidationError(
                    "End datetime must be after start datetime."
                )
        return data


class AuctionItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    sold_to_username = serializers.CharField(source='sold_to.username', read_only=True, allow_null=True)
    auction_event_name = serializers.CharField(source='auction_event.name', read_only=True)
    
    class Meta:
        model = AuctionItem
        fields = [
            'id',
            'auction_event',
            'name',
            'description',
            'image_url',
            'owner',
            'owner_username',
            'starting_price',
            'current_price',
            'status',
            'created_at',
            'updated_at',
            'sold_at',
            'sold_to',
            'sold_to_username',
            'auction_event_name',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_price']
        
    def validate_starting_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Starting price must be positive.")
        return value
    
    def validate(self, data):
        if 'starting_price' in data and 'current_price' in data:
            if data['current_price'] < data['starting_price']:
                raise serializers.ValidationError(
                    "Current price must be greater than or equal to starting price."
                )
        return data

