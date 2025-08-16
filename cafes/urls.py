from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Wishlist endpoints
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', views.WishlistItemView.as_view(), name='wishlist-item'),
    path('wishlist/sync/', views.sync_wishlist, name='sync-wishlist'),
    path('wishlist/share/', views.create_shareable_wishlist, name='create-shareable-wishlist'),
    path('shared/<uuid:share_id>/', views.view_shared_wishlist, name='view-shared-wishlist'),
    
    # Existing endpoints
    path('find-cafes/', views.find_cafes, name='find_cafes'),
] 