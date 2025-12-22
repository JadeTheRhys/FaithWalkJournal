# FaithWalk Journal - Community Moderation Guide

## Quick Start Guide for Checking Comments for Moderation

This guide provides step-by-step instructions for accessing and moderating community posts submitted through the FaithWalk Journal application.

---

## Table of Contents
1. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
2. [Understanding the Dashboard](#understanding-the-dashboard)
3. [Reviewing Pending Posts](#reviewing-pending-posts)
4. [Moderating Posts (Approve/Reject/Delete)](#moderating-posts)
5. [Managing Word Filters](#managing-word-filters)
6. [Viewing Approved and Rejected Posts](#viewing-approved-and-rejected-posts)
7. [Changing Your Admin Password](#changing-your-admin-password)
8. [Best Practices for Moderation](#best-practices-for-moderation)

---

## Accessing the Admin Dashboard

### Step 1: Navigate to the Admin Login Page

1. Open your web browser
2. Go to: **http://localhost:3000/admin** (or replace `localhost:3000` with your server's URL)
3. You will see the Admin Login screen

### Step 2: Log In with Admin Credentials

**Default Credentials:**
- **Username:** `admin`
- **Password:** `changeme123`

⚠️ **IMPORTANT SECURITY NOTE:** 
- Change the default password immediately after your first login!
- The default credentials are publicly documented and should never be used in production

### Step 3: After Login
- You will be redirected to the Admin Dashboard
- Your username will appear in the top-right corner
- A "Logout" button is available when you're done

---

## Understanding the Dashboard

### Statistics Overview (Top of Page)

The dashboard displays four key metrics:

1. **Pending** (Yellow) - Posts awaiting your review
2. **Approved** (Green) - Posts published to the community feed
3. **Rejected** (Red) - Posts that have been rejected
4. **Total** (Sage Green) - All posts in the system

### Navigation Tabs

- **Pending Posts** - Posts that need your review (start here!)
- **Approved Posts** - Posts currently visible to users
- **Rejected Posts** - Posts that were rejected
- **Word Filters** - Manage automatic content filtering
- **Settings** - Change your admin password

---

## Reviewing Pending Posts

### Finding Posts to Review

1. After logging in, you'll see the **"Pending Posts"** tab by default
2. If not, click the **"Pending Posts"** button in the tab navigation
3. All posts awaiting moderation will be displayed here

### Post Information Displayed

Each post card shows:
- **Status Badge** - Yellow "pending" label
- **Timestamp** - When the post was submitted
- **Content** - The full text of the user's submission
- **Flagged Words** (if any) - Warning indicators for filtered content
  - Orange banner: ⚠️ Flagged words: [list of words]
  - Posts with flagged words require extra attention

### What to Look For

✅ **Approve posts that:**
- Share genuine faith experiences, prayers, or encouragement
- Are respectful and supportive
- Align with the community's spiritual focus
- May mention struggles but in a healthy, seeking-help way

❌ **Reject posts that:**
- Contain hate speech, profanity, or aggressive language
- Are spam or promotional content
- Share harmful advice or misinformation
- Violate community standards
- Are off-topic or inappropriate

---

## Moderating Posts

### To Approve a Post

1. Click the **green "Approve"** button below the post
2. A dialog box will appear asking for an optional reason
3. Enter a reason (e.g., "Encouraging message about faith") or leave blank
4. Click "OK"
5. You'll see a success message: "Post approved successfully!"
6. The post will now appear in the Community Insights section on the main page
7. Statistics will update automatically

### To Reject a Post

1. Click the **red "Reject"** button below the post
2. A dialog box will appear asking for an optional reason
3. Enter a reason (e.g., "Contains inappropriate language") - **recommended for record keeping**
4. Click "OK"
5. You'll see a success message: "Post rejected successfully!"
6. The post will move to the "Rejected Posts" tab
7. Statistics will update automatically

### To Delete a Post

1. Click the **red "Delete"** button below the post
2. A confirmation dialog will appear: "Are you sure you want to delete this post?"
3. Click "OK" to confirm
4. Another dialog asks for an optional reason
5. Enter a reason (recommended) or leave blank
6. The post will be permanently removed from the database
7. Use this sparingly - rejection is usually preferred for record keeping

---

## Managing Word Filters

The system includes automatic word filtering with three severity levels to help with pre-moderation.

### Viewing Current Filters

1. Click the **"Word Filters"** tab
2. You'll see a list of all filtered words
3. Each word shows its severity level:
   - **HIGH (Red)** - Auto-rejects posts (e.g., hate speech, violence)
   - **MEDIUM (Orange)** - Flags for review (e.g., death, sad emotions)
   - **LOW (Blue)** - Allows post but logs the word (e.g., angry, upset)

### Adding a New Filter

1. In the "Add New Filter" section at the top
2. Enter the word you want to filter in the text box
3. Select severity from dropdown:
   - **Low** - Allow but log
   - **Medium** - Flag for review
   - **High (Auto-reject)** - Automatically reject
4. Click **"Add Filter"**
5. The word will be added to the filter list

### Removing a Filter

1. Find the word in the filters list
2. Click the red **"Delete"** button next to it
3. Confirm deletion
4. The word will no longer be filtered

### How Filters Work

- Filters check for **whole word matches** (case-insensitive)
- **High severity**: Post is auto-rejected and saved for your review
- **Medium/Low severity**: Post goes to pending with a warning flag
- Users are notified if their post violates guidelines
- All moderation actions are logged

---

## Viewing Approved and Rejected Posts

### Approved Posts Tab

1. Click **"Approved Posts"** in the tab navigation
2. View all posts currently visible to users
3. You can still **Delete** approved posts if needed
4. These posts appear in the "Community Insights" section on the main page

### Rejected Posts Tab

1. Click **"Rejected Posts"** in the tab navigation
2. View all posts that were rejected
3. You can **Delete** rejected posts permanently if needed
4. Review these periodically to refine your word filters

---

## Changing Your Admin Password

**This should be your first action after logging in with default credentials!**

### Steps to Change Password

1. Click the **"Settings"** tab
2. In the "Change Password" section, fill out:
   - **Current Password** - Your current password
   - **New Password** - Your new password (minimum 8 characters)
   - **Confirm New Password** - Type new password again
3. Click **"Change Password"**
4. You'll see "Password changed successfully!"
5. Use your new password for all future logins

### Password Requirements
- Minimum 8 characters
- Use a strong, unique password
- Don't share your password with others
- Change it periodically for security

---

## Best Practices for Moderation

### Consistency
- Apply the same standards to all posts
- Document your decision-making with reasons
- Review pending posts regularly (daily recommended)

### Timeliness
- Users are waiting for their posts to appear
- Try to review posts within 24 hours of submission
- Set up a regular moderation schedule

### Communication
- Rejection reasons help you track patterns
- Use reasons to refine word filters over time
- Document repeated issues from specific patterns

### Safety First
- When in doubt, err on the side of caution
- Protect the community from harmful content
- Approve posts that build up and encourage

### Context Matters
- A word like "death" in "Jesus conquered death" is appropriate
- The same word in a violent context is not
- Read the full post, not just flagged words

### Record Keeping
- The system logs all your moderation actions
- Review your moderation log in the statistics
- Use this to improve your processes

---

## Troubleshooting

### Can't Log In
- Verify you're using the correct username and password
- Check if Caps Lock is on
- Try refreshing the page
- Contact system administrator if issues persist

### Posts Not Appearing
- Check which tab you're viewing (Pending/Approved/Rejected)
- Refresh the page to reload data
- Verify the post wasn't accidentally deleted

### Statistics Not Updating
- Refresh the page
- Statistics update after each moderation action
- Check browser console for errors

---

## Quick Reference Commands

| Action | Location | Button Color |
|--------|----------|--------------|
| Login | http://localhost:3000/admin | - |
| View Pending | Pending Posts tab | - |
| Approve Post | Pending Posts | Green |
| Reject Post | Pending Posts | Red |
| Delete Post | Any tab | Red |
| Add Filter | Word Filters tab | Blue/Primary |
| Change Password | Settings tab | Blue/Primary |

---

## Support

For technical issues or questions:
- Review the README.md file in the repository
- Check the IMPLEMENTATION.md for technical details
- Contact the system administrator
- Review server logs for error messages

---

## Security Reminders

1. ✅ Change default password immediately
2. ✅ Never share admin credentials
3. ✅ Log out when finished
4. ✅ Use HTTPS in production
5. ✅ Set strong JWT_SECRET in production
6. ✅ Review moderation logs regularly
7. ✅ Keep word filters updated

---

**Last Updated:** December 22, 2024  
**Version:** 1.0.0
