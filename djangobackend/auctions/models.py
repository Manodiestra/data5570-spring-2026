from django.db import models
from django.contrib.auth.models import User

# AuctionEvent model
class AuctionEvent(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_auction_events'
    )
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['start_datetime', 'end_datetime']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name


class AuctionItem(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('sold', 'Sold'),
        ('cancelled', 'Cancelled'),
    ]
    
    auction_event = models.ForeignKey(
        AuctionEvent,
        on_delete=models.CASCADE,
        related_name='items',
        db_index=True
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, null=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_items',
        db_index=True
    )
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sold_at = models.DateTimeField(null=True, blank=True)
    sold_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='won_items'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['auction_event']),
            models.Index(fields=['status']),
            models.Index(fields=['owner']),
            models.Index(fields=['current_price']),
        ]
    
    def __str__(self):
        return self.name
