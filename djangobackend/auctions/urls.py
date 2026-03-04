from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuctionEventViewSet, AuctionItemViewSet

router = DefaultRouter()
router.register(r'auctionEvent', AuctionEventViewSet, basename='auctionevent')
router.register(r'auctionItem', AuctionItemViewSet, basename='auctionitem')

urlpatterns = [
    path('', include(router.urls)),
]


