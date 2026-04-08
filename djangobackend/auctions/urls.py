from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuctionEventViewSet,
    AuctionItemViewSet,
    UserProfileMeView,
    GenerateAuctionItemDescriptionView,
)

router = DefaultRouter()
router.register(r'auctionEvent', AuctionEventViewSet, basename='auctionevent')
router.register(r'auctionItem', AuctionItemViewSet, basename='auctionitem')

urlpatterns = [
    path('profile/me/', UserProfileMeView.as_view(), name='profile-me'),
    path('ai/generate-item-description/', GenerateAuctionItemDescriptionView.as_view(), name='ai-generate-item-description'),
    path('', include(router.urls)),
]


