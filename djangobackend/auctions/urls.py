from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuctionEventViewSet

router = DefaultRouter()
router.register(r'auctionEvent', AuctionEventViewSet, basename='auctionevent')

urlpatterns = [
    path('', include(router.urls)),
]


