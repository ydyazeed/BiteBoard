# BiteBoard

BiteBoard is a web application that helps users discover recommended dishes at nearby cafes using AI-powered review analysis.

## Features

- Find nearby cafes using Google Places API
- AI-powered dish recommendations using Google's Gemini API
- User authentication and personalized wishlists
- Modern, responsive UI built with React and Tailwind CSS

## Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication
- Google Places API
- Google Gemini API

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

## Local Development

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# DJANGO_SECRET_KEY=your_secret_key
# GOOGLE_PLACES_API_KEY=your_google_key
# GEMINI_API_KEY=your_gemini_key

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

### Backend (Render.com)
- Deployed URL: [Add your Render URL here]
- Auto-deploys from main branch

### Frontend (Vercel)
- Deployed URL: [Add your Vercel URL here]
- Auto-deploys from main branch

## Environment Variables

### Backend (.env)
```
DJANGO_SECRET_KEY=
GOOGLE_PLACES_API_KEY=
GEMINI_API_KEY=
DEBUG=False
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000  # Development
VITE_API_URL=https://your-backend-url.onrender.com  # Production
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 