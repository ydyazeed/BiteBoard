from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.

class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    dish_name = models.CharField(max_length=200)
    cafe_name = models.CharField(max_length=200)
    cafe_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'dish_name', 'cafe_name']  # Prevent duplicates

    def __str__(self):
        return f"{self.dish_name} at {self.cafe_name}"

class ShareableWishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_wishlists')
    share_id = models.UUIDField(default=uuid.uuid4, unique=True)
    title = models.CharField(max_length=200, default="My Wishlist")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s shared wishlist: {self.title}"
