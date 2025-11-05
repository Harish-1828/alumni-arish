# Jobs For You - Personalized Job Recommendations

## Overview

The "Jobs For You" feature provides personalized job recommendations to alumni based on their preferences for companies, job areas, skills, and locations.

## Features

### 1. **Set Job Preferences**
- Click the **"⚙️ Set Job Preferences"** button in the top bar
- A modal opens where you can configure:
  - **Preferred Companies**: Companies you're interested in
  - **Preferred Job Areas**: Your areas of expertise or interest
  - **Preferred Skills**: Skills you have or want to work with
  - **Preferred Locations**: Locations where you'd like to work

### 2. **Jobs For You Tab**
- Default tab when you open the job board
- Shows only jobs matching your preferences
- Displays count of matched jobs
- Fallback messages if:
  - No preferences set → Prompts to set preferences
  - No matching jobs → Suggests updating preferences or viewing all jobs

### 3. **Preference Storage**
- Preferences are stored locally in browser (localStorage)
- Persists across sessions
- Can be updated anytime
- Visual indicator (✓) shown when preferences are set

## How It Works

### Setting Preferences

1. Click **"⚙️ Set Job Preferences"** button
2. For each category, select an option from dropdown and click "Add"
3. Added preferences appear as tags (can be removed by clicking ×)
4. Click **"Save Preferences"** to save
5. Click **"Clear All"** to remove all preferences

### Viewing Personalized Jobs

1. Navigate to **"Jobs For You"** tab (default view)
2. System filters jobs based on your preferences:
   - **Company Match**: Job company matches your preferred companies (Score: +4)
   - **Job Area Match**: Job area matches your preferred areas (Score: +3)
   - **Skills Match**: Job requires skills you specified (Score: +3)
   - **Location Match**: Job location matches your preferred locations (Score: +2)
3. Jobs with ANY match are shown (OR logic)
4. Results display count of matched jobs

### Filtering Within "Jobs For You"

- You can still use sidebar filters (Companies, Job Areas, Skills, Locations)
- Filters apply ON TOP of your preferences
- This allows you to narrow down your personalized results

## User Interface

### Top Bar Buttons
```
[Manage Job Postings] [+ Post Job] [Manage Internship Postings] [+ Post Internship] [⚙️ Set Job Preferences]
```

### Sidebar Tabs
```
✓ Jobs For You  ← Green checkmark shown when preferences are set
  Jobs
  Internships
```

### Preferences Modal
- Modern, clean design with smooth animations
- Organized sections for each preference type
- Tag-based interface for easy management
- Responsive layout (works on mobile)

## Examples

### Example 1: Software Developer Looking for Remote Work

**Preferences:**
- Companies: Google, Microsoft, Amazon
- Job Areas: Software Development, Web Development
- Skills: JavaScript, React, Node.js, Python
- Locations: Remote, Bangalore, Hyderabad

**Result:** Shows only software development jobs from preferred companies or requiring preferred skills in preferred locations.

### Example 2: Recent Graduate

**Preferences:**
- Job Areas: Entry Level, Training Programs
- Skills: Java, C++, SQL
- Locations: Chennai, Coimbatore

**Result:** Shows entry-level positions requiring Java, C++, or SQL in Chennai or Coimbatore.

## Technical Details

### Data Storage
- **Key**: `alumni_job_preferences`
- **Location**: Browser localStorage
- **Format**: JSON
```json
{
  "companies": ["Google", "Microsoft"],
  "jobAreas": ["Software Development"],
  "skills": ["React", "Node.js"],
  "locations": ["Bangalore", "Remote"]
}
```

### Matching Algorithm
1. Fetch all active jobs from server
2. Apply any URL filters
3. For each job, calculate match score:
   - Company match: +4 points
   - Job area match: +3 points
   - Skills match: +3 points
   - Location match: +2 points
4. Include jobs with score > 0
5. Display with match indicator

### Files Modified/Created

**New Files:**
- `job_posting/job-preferences.css` - Preferences modal styles
- `job_posting/job-preferences.js` - Preferences management logic

**Modified Files:**
- `job_posting/job-sidebar.html` - Added preferences button and updated sidebar
- `job_posting/job-sidebar.css` - Added button and badge styles
- `job_posting/jobs-display.js` - Added Jobs For You functionality

## Keyboard Shortcuts

- **ESC** - Close preferences modal

## Mobile Support

- Fully responsive design
- Touch-friendly buttons
- Scrollable modal on small screens
- Stacked layout for narrow viewports

## Browser Compatibility

- Chrome ✓
- Firefox ✓
- Safari ✓
- Edge ✓
- Requires localStorage support

## Future Enhancements

- [ ] Save preferences to server (user account)
- [ ] Relevance scoring and sorting
- [ ] Email notifications for new matching jobs
- [ ] Machine learning for better recommendations
- [ ] Preference templates for common roles
- [ ] Import preferences from profile/resume

## Troubleshooting

### Preferences Not Saving
- Check browser console for errors
- Ensure localStorage is not disabled
- Try clearing browser cache

### No Jobs Showing
- Verify preferences are set (look for ✓ indicator)
- Try broadening preferences
- Check "Jobs" tab to see all available jobs

### Modal Not Opening
- Check browser console for JavaScript errors
- Ensure job-preferences.js is loaded
- Try refreshing the page

## Support

For issues or feature requests, contact the development team.
