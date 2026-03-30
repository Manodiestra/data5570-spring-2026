from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuctionEventViewSet, AuctionItemViewSet, UserProfileMeView

router = DefaultRouter()
router.register(r'auctionEvent', AuctionEventViewSet, basename='auctionevent')
router.register(r'auctionItem', AuctionItemViewSet, basename='auctionitem')

urlpatterns = [
    path('profile/me/', UserProfileMeView.as_view(), name='profile-me'),
    path('', include(router.urls)),
]


