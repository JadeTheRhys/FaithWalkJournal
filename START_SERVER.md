# Starting the FaithWalk Journal Server

## Quick Start (Most Common)

1. Open a terminal/command prompt
2. Navigate to this project folder
3. Run this command:
   ```bash
   npm start
   ```
4. Keep the terminal window open
5. Open your browser to: http://localhost:3000

## First Time Setup

If this is your first time running the server:

```bash
# Install dependencies (only needed once)
npm install

# Start the server
npm start
```

## What You Should See

When the server starts successfully, you'll see:

```
Default admin user created: username=admin, ******
IMPORTANT: Please change the default password immediately!
WARNING: Using default JWT secret for development. Set JWT_SECRET in production!
FaithWalk Journal server running on port 3000
Frontend: http://localhost:3000
Admin Dashboard: http://localhost:3000/admin
API: http://localhost:3000/api
```

## Accessing the Application

Once the server is running:

- **Main Website:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
  - Username: `admin`
  - Password: `changeme123`

## Stopping the Server

- Press `Ctrl+C` in the terminal
- Or close the terminal window

## Troubleshooting

### "Cannot find module" error
Run: `npm install`

### "Port already in use" error
Another application is using port 3000. Either:
- Stop the other application
- Use a different port: `PORT=3001 npm start`

### Can't connect in browser
- Make sure the server is still running (check terminal)
- Try: http://127.0.0.1:3000
- Check for error messages in the terminal

### "Invalid or expired token" in Admin Dashboard
This is now handled automatically! The application will:
1. Automatically refresh your token when it's about to expire
2. Show you a message if your session truly expires (after 8 hours of inactivity)
3. Ask you to log in again if needed

If you see this error frequently:
- Your session tokens last 8 hours
- Simply log in again when prompted
- The app will automatically keep your session alive while you're using it

### Network errors when sharing posts
The app now automatically retries failed requests up to 3 times with exponential backoff. If you still see errors:
- Check your internet connection
- Make sure the server is running (check the terminal)
- Try refreshing the page
- Check that you can access http://localhost:3000 in your browser

### Community posts not loading
- The app will automatically retry loading posts
- If posts still don't load, check that the server is running
- Try refreshing the page
- Clear your browser cache if problems persist

## Understanding Authentication Issues

### What Changed
We've improved how the application handles authentication:
- **Automatic Token Refresh**: Your session will automatically renew while you're using the admin dashboard
- **Better Error Messages**: You'll see clearer messages if something goes wrong
- **Retry Logic**: Failed network requests automatically retry before giving up
- **Session Management**: Sessions last 8 hours and refresh automatically when needed

### When You Need to Log In Again
You'll only need to log in again if:
- You haven't used the admin dashboard for 8+ hours
- You manually logged out
- You cleared your browser's local storage
- The server was restarted and your token is no longer valid

## Need Help?

See the full troubleshooting guide in `MODERATION_GUIDE.md` or `README.md`
