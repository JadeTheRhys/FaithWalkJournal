# FaithWalk Journal - Community Feed System

A spiritual journaling application with anonymous community sharing, automated moderation, and word filtering.

## Features

### Frontend
- **Anonymous Sharing**: Users can share insights, prayer requests, and encouragement anonymously
- **Real-time Community Feed**: View approved posts from other users with automatic refresh
- **User Feedback**: Clear submission status messages for all posts

### Backend
- **RESTful API**: Express.js backend with SQLite database
- **Automated Word Filtering**: Configurable word filter with three severity levels:
  - **High**: Auto-rejects posts containing these words
  - **Medium**: Flags posts for manual review
  - **Low**: Allows post but logs the word for monitoring
- **Manual Moderation**: Admin dashboard for reviewing, approving, and rejecting posts
- **Security Features**:
  - Input sanitization to prevent XSS attacks
  - JWT authentication for admin routes
  - Rate limiting on API endpoints
  - CORS and Helmet security headers

### Admin Dashboard
- View statistics (pending, approved, rejected posts)
- Review pending posts with flagged word indicators
- Approve or reject posts with reason logging
- Manage word filters (add/delete)
- View moderation history

## Setup

### Prerequisites
- Node.js 14+ and npm

### Quick Start

**⚠️ IMPORTANT: The server must be running to access the application!**

1. Clone the repository:
```bash
git clone https://github.com/JadeTheRhys/FaithWalkJournal.git
cd FaithWalkJournal
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

**Keep the terminal window open** - the server must stay running while you use the application.

The application will be available at:
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- API: http://localhost:3000/api

### Default Admin Credentials
- Username: `admin`
- Password: `changeme123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

### Troubleshooting

**Can't connect to http://localhost:3000/admin?**
- Make sure you've run `npm start` and the server is running
- Check the terminal for "FaithWalk Journal server running on port 3000"
- See `START_SERVER.md` or `MODERATION_GUIDE.md` for detailed troubleshooting

**"Invalid or expired token" errors in Admin Dashboard?**
- This has been fixed! The app now automatically refreshes tokens
- Sessions last 8 hours and refresh automatically while you're active
- If you see this message, it means your session truly expired - just log in again
- See the "Authentication & Session Management" section below for details

**Network errors when sharing posts?**
- The app now automatically retries failed requests
- Check your internet connection
- Make sure the server is running
- Try refreshing the page

**Community posts not loading?**
- The app will automatically retry loading posts
- Check that the server is running
- Try refreshing the page
- Clear your browser cache if problems persist

## API Endpoints

### Public Endpoints

#### Submit a Post
```
POST /api/posts
Content-Type: application/json

{
  "content": "Your post content here"
}
```

Response:
```json
{
  "success": true,
  "message": "Your submission has been sent for moderation...",
  "status": "pending",
  "postId": 123
}
```

#### Get Approved Posts
```
GET /api/posts?limit=10&offset=0
```

Response:
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "content": "Post content",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

### Admin Endpoints

All admin endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Admin Login
```
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "changeme123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

#### Refresh Token
```
POST /api/admin/refresh-token
Authorization: Bearer <old-token>
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

#### Get Posts for Moderation
```
GET /api/admin/posts?status=pending&limit=50&offset=0
Authorization: Bearer <token>
```

#### Approve/Reject Post
```
PUT /api/admin/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",  // or "reject"
  "reason": "Optional reason"
}
```

#### Delete Post
```
DELETE /api/admin/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Optional reason"
}
```

#### Get Word Filters
```
GET /api/admin/filters
Authorization: Bearer <token>
```

#### Add Word Filter
```
POST /api/admin/filters
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "inappropriate",
  "severity": "high"  // "low", "medium", or "high"
}
```

#### Delete Word Filter
```
DELETE /api/admin/filters/:id
Authorization: Bearer <token>
```

#### Get Statistics
```
GET /api/admin/stats
Authorization: Bearer <token>
```

## Database Schema

### Posts Table
- `id`: Primary key
- `content`: Post content (sanitized)
- `timestamp`: Submission time
- `approval_status`: "pending", "approved", or "rejected"
- `flagged_words`: Comma-separated list of flagged words
- `created_at`, `updated_at`: Timestamps

### Moderation Log Table
- `id`: Primary key
- `post_id`: Foreign key to posts
- `action`: Action taken (approve, reject, delete)
- `admin_username`: Admin who took action
- `reason`: Optional reason
- `timestamp`: Action time

### Word Filters Table
- `id`: Primary key
- `word`: The filtered word
- `severity`: "low", "medium", or "high"
- `created_at`: Creation time

### Admin Users Table
- `id`: Primary key
- `username`: Admin username
- `password_hash`: Bcrypt hashed password
- `created_at`: Account creation time

## Security Considerations

1. **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
2. **Word Filtering**: Automated filtering prevents inappropriate content from reaching users
3. **Rate Limiting**: 
   - General API: 100 requests per 15 minutes per IP
   - Post submissions: 10 per hour per IP
4. **Authentication**: JWT-based authentication for admin routes with automatic token refresh
5. **Session Management**: 
   - Tokens expire after 8 hours
   - Automatic token refresh when nearing expiration
   - Tokens refresh at 30 minutes before expiry when admin is active
6. **Error Handling**:
   - Automatic retry logic for network failures (up to 3 retries with exponential backoff)
   - Clear error messages for users
   - Graceful handling of expired tokens
7. **Database**: SQLite with WAL mode for better concurrency
8. **HTTPS**: Use HTTPS in production (configure reverse proxy)

## Authentication & Session Management

### How It Works
The application uses JWT (JSON Web Tokens) for authentication with these features:

- **Token Lifetime**: 8 hours from login
- **Automatic Refresh**: Tokens automatically refresh when you're within 30 minutes of expiration
- **Background Refresh**: The system checks for refresh needs on every admin API call
- **Retry Logic**: Failed requests automatically retry with exponential backoff
- **Session Recovery**: If a token expires, you'll be prompted to log in again

### For Users
You don't need to do anything special! The app handles everything automatically:
- Log in once and the session stays active while you work
- The app will warn you if your session is about to expire
- If you're idle for more than 8 hours, you'll need to log in again
- All your work is saved - logging in again won't lose any data

### For Developers
The token refresh system:
1. Server sends `X-Token-Refresh-Needed` header when token has <30 min left
2. Client automatically calls `/api/admin/refresh-token` endpoint
3. New token is issued and stored, replacing the old one
4. If refresh fails (e.g., token fully expired), user is prompted to log in
5. All authenticated requests use the `authenticatedFetch()` wrapper that handles:
   - Automatic token refresh on 401 errors
   - Retry logic with exponential backoff
   - Proper error handling and user feedback

## Production Deployment

### Environment Variables
Create a `.env` file with:
```
PORT=3000
JWT_SECRET=<your-secure-random-secret>
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

### Recommended Setup
1. Use a reverse proxy (nginx) with HTTPS
2. Change default admin password
3. Set strong JWT_SECRET
4. Configure CORS_ORIGIN to your domain
5. Regular database backups
6. Monitor logs for suspicious activity

## Development

### Project Structure
```
FaithWalkJournal/
├── server/
│   ├── db/
│   │   └── database.js          # Database initialization
│   ├── routes/
│   │   ├── public.js            # Public API routes
│   │   └── admin.js             # Admin API routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── utils/
│   │   └── wordFilter.js        # Word filtering logic
│   └── server.js                # Main server file
├── public/
│   ├── index.html               # Main frontend
│   └── admin.html               # Admin dashboard
├── data/
│   └── faithwalk.db             # SQLite database (auto-created)
├── package.json
├── .gitignore
└── README.md
```

## License

ISC
