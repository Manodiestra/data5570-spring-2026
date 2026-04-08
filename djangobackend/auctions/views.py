import os
from typing import Optional

import anthropic

from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AuctionEvent, AuctionItem, UserProfile
from .serializers import (
    AuctionEventSerializer,
    AuctionItemSerializer,
    UserProfileSerializer,
    profile_display_map_for_subs,
)
from .authentication import CognitoJWTAuthentication


def _anthropic_error_message(err: Exception) -> str:
    # Keep error messages concise for API responses.
    msg = str(err).strip()
    return msg if msg else err.__class__.__name__


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
        # Serializer marks `current_price` read-only, but the DB requires it.
        # Set it server-side to the starting price on create.
        starting_price = serializer.validated_data.get("starting_price")
        serializer.save(
            owner_sub=getattr(self.request.user, "sub", None),
            current_price=starting_price,
        )


class GenerateAuctionItemDescriptionView(APIView):
    """
    POST /api/ai/generate-item-description/

    Body: { "name": "Item name" }
    Response: { "description": "..." }

    Auth: required (JWT).
    """

    authentication_classes = [CognitoJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name")
        if not isinstance(name, str) or not name.strip():
            return Response(
                {"detail": "Missing required field: name"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return Response(
                {"detail": "ANTHROPIC_API_KEY is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Allow overriding model per environment (helps when accounts have different model access).
        model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")

        prompt_name = name.strip()[:200]
        system = (
            "You write concise, accurate auction listing descriptions for university students. "
            "Do not invent brand/model details. If specifics are unknown, keep it general. "
            "Return only the description text (no title, no bullets unless natural)."
        )
        user = (
            f'Write a short auction description (2-4 sentences) for this item name: "{prompt_name}". '
            "Mention condition in a neutral way (if unknown, say 'condition not specified')."
        )

        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model=model,
                max_tokens=200,
                system=system,
                messages=[{"role": "user", "content": user}],
            )

            description: Optional[str] = None
            if getattr(message, "content", None) and len(message.content) > 0:
                first = message.content[0]
                text = getattr(first, "text", None)
                if isinstance(text, str) and text.strip():
                    description = text.strip()

            if not description:
                return Response(
                    {"detail": "Anthropic returned no description text."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response({"description": description}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": f"Anthropic API request error: {_anthropic_error_message(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
