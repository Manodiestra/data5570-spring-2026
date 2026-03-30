from django.contrib import admin
from .models import AuctionEvent, AuctionItem, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['cognito_sub', 'display_name', 'updated_at']
    search_fields = ['cognito_sub', 'display_name']
    readonly_fields = ['updated_at']


@admin.register(AuctionEvent)
class AuctionEventAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'city',
        'state',
        'zip_code',
        'start_datetime',
        'end_datetime',
        'created_by_sub',
        'is_active',
        'created_at',
    ]
    list_filter = ['is_active', 'start_datetime', 'end_datetime', 'created_at']
    search_fields = ['name', 'city', 'state', 'zip_code', 'created_by_sub']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Event Information', {
            'fields': ('name', 'city', 'state', 'zip_code')
        }),
        ('Schedule', {
            'fields': ('start_datetime', 'end_datetime')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by_sub', 'created_at', 'updated_at')
        }),
    )


@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'auction_event',
        'owner_sub',
        'starting_price',
        'current_price',
        'status',
        'created_at',
        'sold_at',
        'sold_to_sub',
    ]
    list_filter = ['status', 'created_at', 'sold_at']
    search_fields = ['name', 'description', 'owner_sub', 'auction_event__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'image_url', 'auction_event', 'owner_sub')
        }),
        ('Pricing', {
            'fields': ('starting_price', 'current_price')
        }),
        ('Status', {
            'fields': ('status', 'sold_at', 'sold_to_sub')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

