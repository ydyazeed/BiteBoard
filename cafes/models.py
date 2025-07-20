from django.db import models
from django.contrib.auth.models import User

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
