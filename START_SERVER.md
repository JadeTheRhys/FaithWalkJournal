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

## Need Help?

See the full troubleshooting guide in `MODERATION_GUIDE.md`
