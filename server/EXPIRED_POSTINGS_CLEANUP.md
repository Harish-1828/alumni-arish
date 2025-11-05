# Expired Job & Internship Postings Cleanup

## Overview

This feature automatically prevents users from posting jobs/internships with past deadlines and provides mechanisms to clean up expired postings.

## Features Implemented

### 1. **Prevention of Past Deadline Submission**

#### Backend Validation
- Both job and internship POST endpoints validate that `applicationDeadline` is not in the past
- Returns error: "Application deadline cannot be in the past"

#### Frontend Validation
- Date input fields have `min` attribute set to today's date
- JavaScript validation prevents form submission with past dates
- User-friendly error messages

### 2. **Automatic Filtering of Expired Postings**

#### Jobs & Internships Display
- The `GET /api/jobs` and `GET /api/internships` endpoints automatically exclude postings with expired deadlines
- Only shows active postings (no deadline OR deadline >= today)
- No UI changes needed - works transparently

### 3. **Manual Cleanup Script**

#### Purpose
Permanently removes expired postings from the database

#### Usage

**Option 1: Using npm script (Recommended)**
```bash
cd server
npm run cleanup-expired
```

**Option 2: Direct execution**
```bash
cd server
node utils/cleanup-expired-postings.js
```

#### What it does
1. Connects to the database
2. Finds all jobs with `applicationDeadline < today`
3. Finds all internships with `applicationDeadline < today`
4. Displays list of expired postings
5. Deletes them from the database
6. Shows summary of deletions

#### Sample Output
```
🔍 Starting cleanup of expired postings...
📅 Current date: 2025-11-05T00:00:00.000Z
✅ Connected to database

📋 Found 3 expired job(s)
Expired jobs:
  1. Software Engineer at TechCorp (Deadline: 2025-10-30)
  2. Data Analyst at DataCo (Deadline: 2025-11-01)
  3. Frontend Developer at WebStudio (Deadline: 2025-10-25)
✅ Deleted 3 expired job(s)

📋 Found 1 expired internship(s)
Expired internships:
  1. Summer Intern at StartupXYZ (Deadline: 2025-10-28)
✅ Deleted 1 expired internship(s)

🎉 Cleanup completed successfully!
📊 Total postings removed: 4
🔌 Database connection closed
```

### 4. **Automated Cleanup (Optional)**

#### Setting Up a Cron Job (Linux/Mac)

**Edit crontab:**
```bash
crontab -e
```

**Add daily cleanup at 2 AM:**
```bash
0 2 * * * cd /path/to/alumni-arish/server && npm run cleanup-expired >> /path/to/logs/cleanup.log 2>&1
```

**Or with absolute node path:**
```bash
0 2 * * * cd /path/to/alumni-arish/server && /usr/bin/node utils/cleanup-expired-postings.js >> /path/to/logs/cleanup.log 2>&1
```

#### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Cleanup Expired Job Postings"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `node.exe`
   - Arguments: `utils/cleanup-expired-postings.js`
   - Start in: `E:\alumni-mepco\alumni-arish\server`

## Configuration

### Database Connection
The cleanup script uses the same database configuration as your main server (`config/database.js`)

### Timezone Considerations
- All date comparisons use local server time
- Deadlines are compared at midnight (00:00:00) of each day
- Ensure your server timezone is correctly set

## Testing

### Test Expired Deadline Prevention

1. Try posting a job with yesterday's date as deadline
2. Should see error: "Application deadline cannot be in the past"

### Test Manual Cleanup

1. Create test postings with past deadlines directly in database
2. Run: `npm run cleanup-expired`
3. Verify postings are removed
4. Check that current postings still exist

### Test Automatic Filtering

1. Add postings with various deadlines (past, today, future)
2. Visit job board
3. Verify only active postings appear
4. Past deadline postings should not display

## Important Notes

⚠️ **Permanent Deletion**: The cleanup script permanently deletes expired postings. There is no undo.

✅ **Safe Operation**: The script only deletes postings with explicit past deadlines. Postings without deadlines are never deleted.

📅 **Grace Period**: Postings expire at midnight on the deadline date. A posting with deadline "2025-11-05" will be active all day on November 5th and expire on November 6th.

## Troubleshooting

### Cleanup Script Fails to Connect
- Verify `config/database.js` is correctly configured
- Ensure MongoDB is running
- Check network connectivity

### Cron Job Not Running
- Check cron logs: `grep CRON /var/log/syslog`
- Verify absolute paths are used
- Ensure user has necessary permissions

### Postings Not Being Filtered
- Check server logs for errors
- Verify date format in database (should be ISO 8601)
- Restart server after code changes

## Future Enhancements

- Email notifications to posting owners before expiration
- Archive expired postings instead of deleting
- Admin dashboard to view and manage expired postings
- Configurable grace period after deadline
- Bulk deadline extension feature

## Support

For issues or questions, contact the development team or check the main project documentation.
