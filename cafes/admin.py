from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import WishlistItem, ShareableWishlist

class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'date_joined', 'last_login', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    inlines = [WishlistItemInline]

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'dish_name', 'cafe_name', 'created_at')
    list_filter = ('user', 'cafe_name', 'created_at')
    search_fields = ('user__username', 'dish_name', 'cafe_name')
    ordering = ('-created_at',)

@admin.register(ShareableWishlist)
class ShareableWishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'share_id', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username', 'title', 'share_id')
    ordering = ('-created_at',)
    readonly_fields = ('share_id',)
