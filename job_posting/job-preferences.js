/**
 * Job Preferences Management
 * Allows alumni to set their job preferences for personalized filtering
 */

const JobPreferences = {
  STORAGE_KEY: 'alumni_job_preferences',

  // Get stored preferences
  get() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading preferences:', e);
    }
    return {
      companies: [],
      jobAreas: [],
      skills: [],
      locations: []
    };
  },

  // Save preferences
  save(preferences) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      return true;
    } catch (e) {
      console.error('Error saving preferences:', e);
      return false;
    }
  },

  // Clear all preferences
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  // Check if user has any preferences set
  hasPreferences() {
    const prefs = this.get();
    return prefs.companies.length > 0 || 
           prefs.jobAreas.length > 0 || 
           prefs.skills.length > 0 || 
           prefs.locations.length > 0;
  },

  // Get count of all preferences
  getCount() {
    const prefs = this.get();
    return prefs.companies.length + 
           prefs.jobAreas.length + 
           prefs.skills.length + 
           prefs.locations.length;
  }
};

// Modal Management
const PreferencesModal = {
  overlay: null,
  modal: null,
  currentPreferences: null,

  init() {
    this.createModal();
    this.loadPreferences();
    this.bindEvents();
    this.loadDropdownOptions();
  },

  createModal() {
    const modalHTML = `
      <div id="preferencesModalOverlay" class="preferences-modal-overlay">
        <div class="preferences-modal">
          <div class="preferences-header">
            <h2>Set Your Job Preferences</h2>
            <button class="close-modal-btn" id="closePreferencesModal">&times;</button>
          </div>
          
          <div class="preferences-body">
            <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
              Set your preferences to see personalized job recommendations in the "Jobs For You" section.
            </p>

            <!-- Companies -->
            <div class="preference-section">
              <label class="preference-label">
                Preferred Companies
                <span class="preference-count" id="companiesCount">0</span>
              </label>
              <p class="preference-help">Select companies you're interested in working for</p>
              <div class="preference-input-group">
                <select id="companySelect" class="preference-select">
                  <option value="">Loading...</option>
                </select>
                <button class="add-tag-btn" id="addCompanyBtn">Add</button>
              </div>
              <div id="companiesTags" class="preference-tags"></div>
            </div>

            <!-- Job Areas -->
            <div class="preference-section">
              <label class="preference-label">
                Preferred Job Areas
                <span class="preference-count" id="jobAreasCount">0</span>
              </label>
              <p class="preference-help">Choose your areas of interest or expertise</p>
              <div class="preference-input-group">
                <select id="jobAreaSelect" class="preference-select">
                  <option value="">Loading...</option>
                </select>
                <button class="add-tag-btn" id="addJobAreaBtn">Add</button>
              </div>
              <div id="jobAreasTags" class="preference-tags"></div>
            </div>

            <!-- Skills -->
            <div class="preference-section">
              <label class="preference-label">
                Preferred Skills
                <span class="preference-count" id="skillsCount">0</span>
              </label>
              <p class="preference-help">Select skills you have or want to work with</p>
              <div class="preference-input-group">
                <select id="skillSelect" class="preference-select">
                  <option value="">Loading...</option>
                </select>
                <button class="add-tag-btn" id="addSkillBtn">Add</button>
              </div>
              <div id="skillsTags" class="preference-tags"></div>
            </div>

            <!-- Locations -->
            <div class="preference-section">
              <label class="preference-label">
                Preferred Locations
                <span class="preference-count" id="locationsCount">0</span>
              </label>
              <p class="preference-help">Choose locations where you'd like to work</p>
              <div class="preference-input-group">
                <select id="locationSelect" class="preference-select">
                  <option value="">Loading...</option>
                </select>
                <button class="add-tag-btn" id="addLocationBtn">Add</button>
              </div>
              <div id="locationsTags" class="preference-tags"></div>
            </div>
          </div>

          <div class="preferences-footer">
            <button class="btn-clear-preferences" id="clearPreferencesBtn">Clear All</button>
            <button class="btn-save-preferences" id="savePreferencesBtn">Save Preferences</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.overlay = document.getElementById('preferencesModalOverlay');
    this.modal = this.overlay.querySelector('.preferences-modal');
  },

  bindEvents() {
    // Close modal
    document.getElementById('closePreferencesModal').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Add buttons
    document.getElementById('addCompanyBtn').addEventListener('click', () => this.addTag('companies', 'companySelect'));
    document.getElementById('addJobAreaBtn').addEventListener('click', () => this.addTag('jobAreas', 'jobAreaSelect'));
    document.getElementById('addSkillBtn').addEventListener('click', () => this.addTag('skills', 'skillSelect'));
    document.getElementById('addLocationBtn').addEventListener('click', () => this.addTag('locations', 'locationSelect'));

    // Save and clear
    document.getElementById('savePreferencesBtn').addEventListener('click', () => this.save());
    document.getElementById('clearPreferencesBtn').addEventListener('click', () => this.clearAll());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
        this.close();
      }
    });
  },

  async loadDropdownOptions() {
    try {
      // Load companies
      const companiesRes = await fetch('http://localhost:5000/api/companies');
      const companies = await companiesRes.json();
      this.populateSelect('companySelect', companies);

      // Load job areas
      const jobAreasRes = await fetch('http://localhost:5000/api/job-areas');
      const jobAreas = await jobAreasRes.json();
      this.populateSelect('jobAreaSelect', jobAreas);

      // Load skills
      const skillsRes = await fetch('http://localhost:5000/api/skills');
      const skills = await skillsRes.json();
      this.populateSelect('skillSelect', skills);

      // Load locations
      const locationsRes = await fetch('http://localhost:5000/api/locations');
      const locations = await locationsRes.json();
      this.populateSelect('locationSelect', locations);
    } catch (e) {
      console.error('Error loading dropdown options:', e);
    }
  },

  populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Select --</option>' +
      options.map(opt => `<option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt)}</option>`).join('');
  },

  loadPreferences() {
    this.currentPreferences = JobPreferences.get();
    this.renderTags();
  },

  renderTags() {
    this.renderTagGroup('companies', 'companiesTags', 'companiesCount');
    this.renderTagGroup('jobAreas', 'jobAreasTags', 'jobAreasCount');
    this.renderTagGroup('skills', 'skillsTags', 'skillsCount');
    this.renderTagGroup('locations', 'locationsTags', 'locationsCount');
  },

  renderTagGroup(key, containerId, countId) {
    const container = document.getElementById(containerId);
    const values = this.currentPreferences[key] || [];
    
    document.getElementById(countId).textContent = values.length;

    if (values.length === 0) {
      container.innerHTML = '<div class="no-preferences-msg">No preferences set</div>';
      return;
    }

    container.innerHTML = values.map(value => `
      <div class="preference-tag">
        <span>${this.escapeHtml(value)}</span>
        <span class="remove-tag" data-key="${key}" data-value="${this.escapeHtml(value)}">&times;</span>
      </div>
    `).join('');

    // Bind remove events
    container.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const value = btn.getAttribute('data-value');
        this.removeTag(key, value);
      });
    });
  },

  addTag(key, selectId) {
    const select = document.getElementById(selectId);
    const value = select.value.trim();

    if (!value) {
      return;
    }

    if (!this.currentPreferences[key].includes(value)) {
      this.currentPreferences[key].push(value);
      this.renderTags();
    }

    select.value = '';
  },

  removeTag(key, value) {
    this.currentPreferences[key] = this.currentPreferences[key].filter(v => v !== value);
    this.renderTags();
  },

  clearAll() {
    if (!confirm('Are you sure you want to clear all preferences?')) {
      return;
    }

    this.currentPreferences = {
      companies: [],
      jobAreas: [],
      skills: [],
      locations: []
    };
    this.renderTags();
  },

  save() {
    if (JobPreferences.save(this.currentPreferences)) {
      alert('✅ Preferences saved successfully!\n\nYou can now see personalized jobs in the "Jobs For You" section.');
      this.close();
      
      // Reload page if on Jobs For You tab
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'jobs-for-you') {
        location.reload();
      }
    } else {
      alert('❌ Error saving preferences. Please try again.');
    }
  },

  open() {
    this.loadPreferences();
    this.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.overlay.classList.remove('show');
    document.body.style.overflow = '';
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PreferencesModal.init();
});

// Export for use in other scripts
window.JobPreferences = JobPreferences;
window.PreferencesModal = PreferencesModal;
