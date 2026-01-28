from django.contrib import admin
from django.contrib.auth.models import User
from .models import AuctionEvent, AuctionItem


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
        'created_by',
        'is_active',
        'created_at',
    ]
    list_filter = ['is_active', 'start_datetime', 'end_datetime', 'created_at']
    search_fields = ['name', 'city', 'state', 'zip_code', 'created_by__username']
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
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'auction_event',
        'owner',
        'starting_price',
        'current_price',
        'status',
        'created_at',
        'sold_at',
        'sold_to',
    ]
    list_filter = ['status', 'created_at', 'sold_at']
    search_fields = ['name', 'description', 'owner__username', 'auction_event__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'image_url', 'auction_event', 'owner')
        }),
        ('Pricing', {
            'fields': ('starting_price', 'current_price')
        }),
        ('Status', {
            'fields': ('status', 'sold_at', 'sold_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

