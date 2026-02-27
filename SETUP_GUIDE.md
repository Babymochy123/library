# Library Management System - Setup & Running Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd my_project
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt psycopg2-binary
```

### 2. Database Setup
Make sure PostgreSQL is running with:
- Database: `library_management`
- User: `postgres`
- Password: `1412005`
- Host: `localhost`
- Port: `5432`

If the database doesn't exist, create it:
```bash
createdb -U postgres library_management
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Create Superuser (Optional, for admin access)
```bash
python manage.py createsuperuser
```

### 5. Start Django Server
```bash
python manage.py runserver
```
The backend will be available at `http://127.0.0.1:8000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd my_project/frontend
npm install
```

### 2. Start React Development Server
```bash
npm start
```
The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- **Login**: `POST /api/token/`
  - Request: `{"username": "user", "password": "pass"}`
  - Response: `{"access": "token...", "refresh": "token..."}`

- **Refresh Token**: `POST /api/token/refresh/`
  - Request: `{"refresh": "refresh_token"}`
  - Response: `{"access": "new_token"}`

- **Sign Up**: `POST /api/signup/signup/`
  - Request: `{"username": "user", "email": "user@example.com", "password": "pass"}`
  - Response: User object

### Books
- **List Books**: `GET /api/books/`
- **Get Book**: `GET /api/books/{id}/`
- **Create Book**: `POST /api/books/` (requires authentication)
- **Update Book**: `PATCH /api/books/{id}/` (requires authentication)
- **Delete Book**: `DELETE /api/books/{id}/` (requires authentication)

### Borrow Records
- **List User's Borrows**: `GET /api/borrow/`
- **Get Borrow Record**: `GET /api/borrow/{id}/`
- **Create Borrow Record**: `POST /api/borrow/`
- **Issue Book**: `POST /api/borrow/{id}/issue_book/`
- **Return Book**: `POST /api/borrow/{id}/return_book/`
  - Request: `{"return_date": "2024-12-25"}`
  - Response: `{"fine": 0.00}`

## Features

### Frontend Components
- **Login**: User authentication with JWT tokens
- **Sign Up**: New user registration
- **Book List**: Browse all available books
- **Borrow Form**: Borrow books by ID
- **Borrow History**: View all borrow records
- **Returning Form**: Return books and calculate fines

### Key Features
- JWT Token-based authentication
- Token refresh mechanism
- Protected routes (require login)
- Automatic token refresh on 401 errors
- User-specific borrow records
- Fine calculation for late returns

## Troubleshooting

### CORS Issues
- CORS is already enabled in `settings.py`
- Both `127.0.0.1` and `localhost` are in ALLOWED_HOSTS

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `settings.py`
- Ensure database `library_management` exists

### Port Already in Use
- Django: Change port with `python manage.py runserver 8001`
- React: Change port with `PORT=3001 npm start`

### Token Invalid Errors
- Clear localStorage: Open DevTools → Application → Local Storage → Clear All
- Re-login to get new tokens
