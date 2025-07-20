from django.contrib import admin
from .models import WishlistItem

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'dish_name', 'cafe_name', 'created_at')
    list_filter = ('user', 'cafe_name', 'created_at')
    search_fields = ('user__username', 'dish_name', 'cafe_name')
    ordering = ('-created_at',)
