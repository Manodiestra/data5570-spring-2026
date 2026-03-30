from rest_framework import serializers
from .models import AuctionEvent, AuctionItem, UserProfile


def profile_display_map_for_subs(subs):
    subs = {s for s in subs if s}
    if not subs:
        return {}
    rows = UserProfile.objects.filter(cognito_sub__in=subs).values('cognito_sub', 'display_name')
    return {r['cognito_sub']: r['display_name'] for r in rows}


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['cognito_sub', 'display_name', 'updated_at']
        read_only_fields = ['cognito_sub', 'updated_at']


class AuctionEventSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    created_by_display_name = serializers.SerializerMethodField()

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
            'created_by_sub',
            'created_by_display_name',
            'is_active',
            'items_count',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_sub', 'created_by_display_name']
    
    def get_items_count(self, obj):
        return obj.items.count()

    def get_created_by_display_name(self, obj):
        m = self.context.get('profile_display_by_sub') or {}
        name = m.get(obj.created_by_sub)
        return name if name else None
    
    def validate(self, data):
        if 'start_datetime' in data and 'end_datetime' in data:
            if data['end_datetime'] <= data['start_datetime']:
                raise serializers.ValidationError(
                    "End datetime must be after start datetime."
                )
        return data


class AuctionItemSerializer(serializers.ModelSerializer):
    auction_event_name = serializers.CharField(source='auction_event.name', read_only=True)
    owner_display_name = serializers.SerializerMethodField()
    sold_to_display_name = serializers.SerializerMethodField()

    class Meta:
        model = AuctionItem
        fields = [
            'id',
            'auction_event',
            'name',
            'description',
            'image_url',
            'owner_sub',
            'owner_display_name',
            'starting_price',
            'current_price',
            'status',
            'created_at',
            'updated_at',
            'sold_at',
            'sold_to_sub',
            'sold_to_display_name',
            'auction_event_name',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'current_price',
            'owner_sub',
            'sold_to_sub',
            'owner_display_name',
            'sold_to_display_name',
        ]
        
    def get_owner_display_name(self, obj):
        m = self.context.get('profile_display_by_sub') or {}
        name = m.get(obj.owner_sub)
        return name if name else None

    def get_sold_to_display_name(self, obj):
        if not obj.sold_to_sub:
            return None
        m = self.context.get('profile_display_by_sub') or {}
        name = m.get(obj.sold_to_sub)
        return name if name else None

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

