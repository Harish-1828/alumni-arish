let currentType = 'jobs';
let loggedInUser = null;

document.addEventListener('DOMContentLoaded', () => {
  // Get logged-in user
  loggedInUser = sessionStorage.getItem('loggedInUser');
  
  if (!loggedInUser) {
    displayError('You must be logged in to manage postings.');
    return;
  }

  // Setup tab switching
  setupTabs();

  // Check URL parameter for initial type
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const initialType = (typeParam === 'internships') ? 'internships' : 'jobs';
  
  // Set active tab based on URL parameter
  if (initialType === 'internships') {
    document.querySelectorAll('.tab-btn').forEach(tab => {
      if (tab.getAttribute('data-type') === 'internships') {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // Load initial postings
  currentType = initialType;
  loadPostings(initialType);
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Load postings for selected type
      currentType = type;
      loadPostings(type);
    });
  });
}

async function loadPostings(type) {
  const container = document.getElementById('postings-list');
  container.innerHTML = '<div class="loading-msg">Loading your postings...</div>';

  try {
    const endpoint = type === 'jobs' 
      ? `http://localhost:5000/api/my-jobs/${encodeURIComponent(loggedInUser)}`
      : `http://localhost:5000/api/my-internships/${encodeURIComponent(loggedInUser)}`;

    const res = await fetch(endpoint, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error('Failed to load postings');
    }

    const postings = await res.json();

    if (!Array.isArray(postings) || postings.length === 0) {
      container.innerHTML = `<div class="no-postings-msg">You haven't posted any ${type} yet.</div>`;
      return;
    }

    // Render postings
    if (type === 'jobs') {
      container.innerHTML = postings.map(renderJobCard).join('');
    } else {
      container.innerHTML = postings.map(renderInternshipCard).join('');
    }

    // Bind delete buttons
    bindDeleteButtons();

  } catch (error) {
    console.error('Error loading postings:', error);
    container.innerHTML = `<div class="error-msg">Failed to load postings. Please try again.</div>`;
  }
}

function renderJobCard(job) {
  const title = esc(job.jobTitle || '');
  const company = esc(job.company || '');
  const companyWebsite = job.companyWebsite ? esc(job.companyWebsite) : '';
  const jobArea = esc(job.jobArea || '—');
  const skillsArr = Array.isArray(job.skills) ? job.skills : [];
  const locArr = Array.isArray(job.location) ? job.location : [];
  const exp = formatExperience(job.experienceFrom, job.experienceTo);
  const posted = formatDate(job.postedDate);
  const salary = esc(job.salary || '—');
  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : '—';
  const contactEmail = esc(job.contactEmail || '');
  const description = esc(job.jobDescription || '');

  const skillsHtml = skillsArr.length ? skillsArr.map(s => esc(s)).join(', ') : '—';
  const locationsHtml = locArr.length ? locArr.map(l => esc(l)).join(', ') : '—';

  return `
    <div class="posting-card" data-id="${job._id}" data-type="jobs">
      <div class="posting-header">
        <div>
          <h2 class="posting-title">${title}</h2>
          <div class="posting-company">${company}${companyWebsite ? ` | <a href="${esc(companyWebsite)}" target="_blank">Website</a>` : ''}</div>
          <div class="posting-posted-date">Posted: ${posted}</div>
        </div>
        <div class="posting-actions">
          <button class="delete-btn" onclick="deletePosting('${job._id}', 'jobs')">Delete</button>
        </div>
      </div>
      
      <div class="posting-details">
        <div class="posting-detail-item">
          <span class="detail-label">Location</span>
          <span class="detail-value">${locationsHtml}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Job Area</span>
          <span class="detail-value">${jobArea}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Experience</span>
          <span class="detail-value">${exp}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Salary</span>
          <span class="detail-value">${salary}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Skills</span>
          <span class="detail-value">${skillsHtml}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Contact Email</span>
          <span class="detail-value">${contactEmail}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Deadline</span>
          <span class="detail-value">${deadline}</span>
        </div>
      </div>

      <div class="posting-description">
        <div class="detail-label">Job Description</div>
        <div class="detail-value">${description}</div>
      </div>
    </div>
  `;
}

function renderInternshipCard(internship) {
  const title = esc(internship.title || '');
  const company = esc(internship.company || '');
  const companyWebsite = internship.companyWebsite ? esc(internship.companyWebsite) : '';
  const jobArea = esc(internship.jobArea || '—');
  const skillsArr = Array.isArray(internship.skills) ? internship.skills : [];
  const locArr = Array.isArray(internship.location) ? internship.location : [];
  const posted = formatDate(internship.postedDate);
  const duration = esc(internship.duration || '—');
  const stipend = esc(internship.stipend || '—');
  const deadline = internship.applicationDeadline ? formatDate(internship.applicationDeadline) : '—';
  const contactEmail = esc(internship.contactEmail || '');
  const description = esc(internship.description || '');

  const skillsHtml = skillsArr.length ? skillsArr.map(s => esc(s)).join(', ') : '—';
  const locationsHtml = locArr.length ? locArr.map(l => esc(l)).join(', ') : '—';

  return `
    <div class="posting-card" data-id="${internship._id}" data-type="internships">
      <div class="posting-header">
        <div>
          <h2 class="posting-title">${title}</h2>
          <div class="posting-company">${company}${companyWebsite ? ` | <a href="${esc(companyWebsite)}" target="_blank">Website</a>` : ''}</div>
          <div class="posting-posted-date">Posted: ${posted}</div>
        </div>
        <div class="posting-actions">
          <button class="delete-btn" onclick="deletePosting('${internship._id}', 'internships')">Delete</button>
        </div>
      </div>
      
      <div class="posting-details">
        <div class="posting-detail-item">
          <span class="detail-label">Location</span>
          <span class="detail-value">${locationsHtml}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Job Area</span>
          <span class="detail-value">${jobArea}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${duration}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Stipend</span>
          <span class="detail-value">${stipend}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Skills</span>
          <span class="detail-value">${skillsHtml}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Contact Email</span>
          <span class="detail-value">${contactEmail}</span>
        </div>
        <div class="posting-detail-item">
          <span class="detail-label">Deadline</span>
          <span class="detail-value">${deadline}</span>
        </div>
      </div>

      <div class="posting-description">
        <div class="detail-label">Description</div>
        <div class="detail-value">${description}</div>
      </div>
    </div>
  `;
}

function bindDeleteButtons() {
  // Delete buttons are bound via onclick attribute in HTML
  // This function is kept for potential future use
}

async function deletePosting(id, type) {
  if (!confirm(`Are you sure you want to delete this ${type === 'jobs' ? 'job' : 'internship'}? This action cannot be undone.`)) {
    return;
  }

  const endpoint = type === 'jobs'
    ? `http://localhost:5000/api/jobs/${id}`
    : `http://localhost:5000/api/internships/${id}`;

  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: loggedInUser })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      alert(result.message || 'Deleted successfully');
      // Reload the postings
      loadPostings(currentType);
    } else {
      alert(result.message || 'Failed to delete posting');
    }
  } catch (error) {
    console.error('Error deleting posting:', error);
    alert('Network error. Please try again.');
  }
}

function formatExperience(from, to) {
  const hasFrom = from !== undefined && from !== null && String(from) !== '';
  const hasTo = to !== undefined && to !== null && String(to) !== '';
  if (hasFrom && hasTo) return `${Number(from)} - ${Number(to)} Years`;
  if (hasFrom && !hasTo) return `${Number(from)}+ Years`;
  if (!hasFrom && hasTo) return `Up to ${Number(to)} Years`;
  return '—';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function displayError(message) {
  const container = document.getElementById('postings-list');
  container.innerHTML = `<div class="error-msg">${esc(message)}</div>`;
}
