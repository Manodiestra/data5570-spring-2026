from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from .models import AuctionEvent, AuctionItem, UserProfile
from .serializers import (
    AuctionEventSerializer,
    AuctionItemSerializer,
    UserProfileSerializer,
    profile_display_map_for_subs,
)
from .authentication import CognitoJWTAuthentication


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = getattr(request, "user", None)
        user_sub = getattr(user, "sub", None)
        return bool(user_sub) and getattr(obj, "owner_sub", None) == user_sub


class ProfileDisplayContextMixin:
    """Attach profile display_name map for serializer read-only display fields."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        qs = self.filter_queryset(self.get_queryset())
        if self.serializer_class is AuctionEventSerializer:
            subs = set(qs.values_list("created_by_sub", flat=True))
        elif self.serializer_class is AuctionItemSerializer:
            subs = set()
            for row in qs.values("owner_sub", "sold_to_sub"):
                subs.add(row["owner_sub"])
                if row["sold_to_sub"]:
                    subs.add(row["sold_to_sub"])
        else:
            return context
        context["profile_display_by_sub"] = profile_display_map_for_subs(subs)
        return context


class UserProfileMeView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/profile/me/ — current user's profile (creates row on first access).
    """

    serializer_class = UserProfileSerializer
    authentication_classes = [CognitoJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _default_display_name(self):
        user = self.request.user
        email = getattr(user, "email", None) or getattr(user, "username", None)
        if email and "@" in email:
            return email.split("@")[0][:150]
        if email:
            return str(email)[:150]
        return ""

    def get_object(self):
        sub = self.request.user.sub
        profile, _ = UserProfile.objects.get_or_create(
            cognito_sub=sub,
            defaults={"display_name": self._default_display_name()},
        )
        return profile


class AuctionEventViewSet(ProfileDisplayContextMixin, viewsets.ModelViewSet):
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
    authentication_classes = [CognitoJWTAuthentication]
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by_sub=getattr(self.request.user, "sub", None))
    
    def update(self, request, *args, **kwargs):
        """Handle PUT requests for full update."""
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests."""
        return super().destroy(request, *args, **kwargs)


class AuctionItemViewSet(ProfileDisplayContextMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing AuctionItem instances.

    Supports:
    - GET /api/auctionItem/ - List all items
    - POST /api/auctionItem/ - Create new item
    - GET /api/auctionItem/{id}/ - Retrieve specific item
    - PUT /api/auctionItem/{id}/ - Full update of item
    - PATCH /api/auctionItem/{id}/ - Partial update of item
    - DELETE /api/auctionItem/{id}/ - Delete item
    """
    queryset = AuctionItem.objects.select_related('auction_event').all()
    serializer_class = AuctionItemSerializer
    authentication_classes = [CognitoJWTAuthentication]
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner_sub=getattr(self.request.user, "sub", None))
