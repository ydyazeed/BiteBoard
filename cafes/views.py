import logging
import requests
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import WishlistItem, ShareableWishlist
from .serializers import UserSerializer, RegisterSerializer, WishlistItemSerializer, ShareableWishlistSerializer

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Authentication Views
class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# Wishlist Views
class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        logger.info(f"Getting wishlist for user: {self.request.user.username}")
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        logger.info(f"Creating wishlist item for user: {self.request.user.username}")
        logger.info(f"Data: {self.request.data}")
        serializer.save(user=self.request.user)

class WishlistItemView(generics.DestroyAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def sync_wishlist(request):
    """
    Sync local wishlist with server
    """
    logger.info(f"Syncing wishlist for user: {request.user.username}")
    items = WishlistItem.objects.filter(user=request.user)
    serializer = WishlistItemSerializer(items, many=True)
    logger.info(f"Returning {len(items)} wishlist items")
    logger.info(f"Data: {serializer.data}")
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_shareable_wishlist(request):
    """
    Create a shareable wishlist link
    """
    try:
        logger.info(f"Creating shareable wishlist for user: {request.user.username}")
        logger.info(f"Request data: {request.data}")
        
        title = request.data.get('title', f"{request.user.username}'s Wishlist")
        
        # Create shareable wishlist
        shareable_wishlist = ShareableWishlist.objects.create(
            user=request.user,
            title=title
        )
        
        logger.info(f"Created shareable wishlist with ID: {shareable_wishlist.share_id}")
        
        # Get user's wishlist items
        wishlist_items = WishlistItem.objects.filter(user=request.user)
        
        # Include wishlist items in response
        serializer = ShareableWishlistSerializer(shareable_wishlist)
        response_data = serializer.data
        response_data['wishlist_items'] = WishlistItemSerializer(wishlist_items, many=True).data
        
        logger.info(f"Returning response: {response_data}")
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating shareable wishlist: {str(e)}")
        return Response(
            {"error": f"Failed to create shareable wishlist: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def view_shared_wishlist(request, share_id):
    """
    View a shared wishlist by share_id
    """
    try:
        shareable_wishlist = ShareableWishlist.objects.get(
            share_id=share_id, 
            is_active=True
        )
        wishlist_items = WishlistItem.objects.filter(user=shareable_wishlist.user)
        
        serializer = ShareableWishlistSerializer(shareable_wishlist)
        response_data = serializer.data
        response_data['wishlist_items'] = WishlistItemSerializer(wishlist_items, many=True).data
        
        return Response(response_data)
    except ShareableWishlist.DoesNotExist:
        return Response(
            {"error": "Shared wishlist not found or expired"}, 
            status=status.HTTP_404_NOT_FOUND
        )

def analyze_reviews_for_dishes(cafe_name, reviews):
    """
    Analyze reviews using Gemini API to extract recommended dishes.
    """
    # Extract review texts
    review_texts = []
    for review in reviews:
        if isinstance(review, dict):
            text = review.get('text', '')
            if isinstance(text, str):
                review_texts.append(text)
            elif isinstance(text, dict):
                review_texts.append(text.get('text', ''))

    if not review_texts:
        return "No reviews available for analysis"

    # Construct the prompt
    prompt = f"""
    Task: Analyze cafe reviews and identify recommended dishes.
    
    Cafe Name: {cafe_name}
    
    Reviews:
    {' | '.join(review_texts)}
    
    Instructions:
    1. Identify dishes, beverages, or food items that are mentioned positively
    2. Focus on items that are specifically named or clearly described
    3. If no specific dishes are mentioned, identify the type of food/beverages they're known for
    4. Limit to 3-5 most recommended items
    
    Format your response as a simple comma-separated list of items.
    Example format: "Cappuccino, Chocolate Croissant, Blueberry Muffin"
    
    If no specific items can be identified, respond with: "No specific dishes mentioned"
    """
    
    try:
        logger.info(f"Sending reviews to Gemini API for {cafe_name}")
        
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': settings.GEMINI_API_KEY
        }
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=data)
        logger.info(f"Gemini API response status: {response.status_code}")
        logger.info(f"Gemini API response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result:
                recommended_dishes = result['candidates'][0]['content']['parts'][0]['text'].strip()
                logger.info(f"Successfully analyzed reviews for {cafe_name}: {recommended_dishes}")
                return recommended_dishes
            else:
                logger.error(f"Unexpected response structure: {result}")
                return "Error: Unexpected response structure"
        else:
            logger.error(f"API request failed with status {response.status_code}: {response.text}")
            return "Error analyzing reviews"
            
    except Exception as e:
        logger.error(f"Error analyzing reviews for {cafe_name}: {str(e)}")
        return "Error analyzing reviews"

@csrf_exempt
@require_http_methods(["POST"])
def find_cafes(request):
    """
    API endpoint to find nearby cafes and analyze their reviews.
    """
    try:
        logger.info("Received request to find cafes")
        logger.info(f"Request body: {request.body.decode('utf-8')}")
        
        data = json.loads(request.body)
        lat = float(data.get('latitude', 0))
        lng = float(data.get('longitude', 0))
        
        if lat == 0 or lng == 0:
            logger.error("Invalid location data received")
            return JsonResponse({"error": "Location data not available"}, status=400)
        
        logger.info(f"Searching for cafes near coordinates: {lat}, {lng}")
        
        # First, search for cafes using Text Search API
        search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            'query': f'cafes near {lat},{lng}',
            'location': f'{lat},{lng}',
            'radius': '2000',
            'type': 'cafe',
            'key': settings.GOOGLE_PLACES_API_KEY
        }
        
        response = requests.get(search_url, params=params)
        data = response.json()
        
        if response.status_code == 200 and data.get('status') == 'OK':
            logger.info("Successfully retrieved cafe data from Google Places API")
            cafes = []
            
            # Get places
            places = data.get('results', [])
            logger.info(f"Found {len(places)} cafes in initial search")
            
            for place in places[:5]:  # Get details for top 5 places
                place_id = place['place_id']
                
                # Get place details
                details_url = "https://maps.googleapis.com/maps/api/place/details/json"
                details_params = {
                    'place_id': place_id,
                    'fields': 'name,rating,formatted_address,reviews',
                    'key': settings.GOOGLE_PLACES_API_KEY
                }
                
                details_response = requests.get(details_url, params=details_params)
                details_data = details_response.json()
                
                if details_response.status_code == 200 and details_data.get('status') == 'OK':
                    result = details_data.get('result', {})
                    reviews = result.get('reviews', [])
                    cafe_name = place.get('name', 'Unknown')
                    
                    # Analyze reviews to get recommended dishes
                    recommended_dishes = analyze_reviews_for_dishes(cafe_name, reviews)
                    
                    cafe_info = {
                        'name': cafe_name,
                        'rating': place.get('rating', 'N/A'),
                        'address': result.get('formatted_address', place.get('formatted_address', 'Address not available')),
                        'recommended_dishes': recommended_dishes
                    }
                    cafes.append(cafe_info)
                    logger.info(f"Retrieved and analyzed details for cafe: {cafe_info['name']}")
                else:
                    logger.error(f"Failed to get details for cafe {place_id}: {details_response.text}")
            
            return JsonResponse({"cafes": cafes})
        else:
            error_message = data.get('status', 'Unknown error')
            logger.error(f"Error from Google Places API: {error_message}")
            logger.error(f"Full API response: {data}")
            return JsonResponse({"error": f"Failed to fetch nearby cafes: {error_message}"}, status=500)
            
    except ValueError as ve:
        logger.error(f"Invalid location data: {str(ve)}")
        return JsonResponse({"error": "Invalid location data"}, status=400)
    except Exception as e:
        logger.error(f"Error occurred while fetching cafes: {str(e)}")
        return JsonResponse({"error": "An error occurred while fetching nearby cafes"}, status=500)
