from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import AuctionEvent
from .serializers import AuctionEventSerializer


class AuctionEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing AuctionEvent instances.
    
    Supports:
    - GET /api/auctionEvent/ - List all events
    - POST /api/auctionEvent/ - Create new event
    - GET /api/auctionEvent/{id}/ - Retrieve specific event
    - PUT /api/auctionEvent/{id}/ - Full update of event
    - PATCH /api/auctionEvent/{id}/ - Partial update of event
    - DELETE /api/auctionEvent/{id}/ - Delete event
    """
    queryset = AuctionEvent.objects.all()
    serializer_class = AuctionEventSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        """Handle PUT requests for full update."""
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests."""
        return super().destroy(request, *args, **kwargs)
