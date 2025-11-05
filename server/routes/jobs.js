const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { normalizeToArray, escapeRegex, asyncHandler } = require('../utils/helpers');

// Job Schema
const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  companyWebsite: String,
  experienceFrom: Number,
  experienceTo: Number,
  location: [String],
  contactEmail: { type: String, required: true },
  jobArea: String,
  skills: [String],
  salary: String,
  applicationDeadline: String,
  jobDescription: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  postedBy: { type: String, required: true }, // Alumni identifier who posted the job
});

// Internship Schema
const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyWebsite: String,
  duration: String,
  location: [String],
  contactEmail: { type: String, required: true },
  jobArea: String,
  skills: [String],
  stipend: String,
  applicationDeadline: String,
  description: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  postedBy: { type: String, required: true }, // Alumni identifier who posted the internship
});

const Job = mongoose.model('Job', jobSchema, 'jobposts');
const Internship = mongoose.model('Internship', internshipSchema, 'internships');

// ---------------- JOB ROUTES ---------------- //

// Get distinct companies
router.get('/companies', asyncHandler(async (req, res) => {
  const names = await Job.distinct('company');
  const clean = names.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct job areas
router.get('/job-areas', asyncHandler(async (req, res) => {
  const areas = await Job.distinct('jobArea');
  const clean = areas.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct skills
router.get('/skills', asyncHandler(async (req, res) => {
  const skills = await Job.distinct('skills');
  const clean = skills.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct locations
router.get('/locations', asyncHandler(async (req, res) => {
  const locs = await Job.distinct('location');
  const clean = locs.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get all jobs with filters (excluding expired ones)
router.get('/jobs', asyncHandler(async (req, res) => {
  const { company, jobArea, skill, location } = req.query;
  const query = {};

  if (company) {
    query.company = { $regex: new RegExp(`^${escapeRegex(company)}$`, 'i') };
  }
  if (jobArea) {
    query.jobArea = { $regex: new RegExp(`^${escapeRegex(jobArea)}$`, 'i') };
  }
  if (skill) {
    query.skills = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(skill)}$`, 'i') } };
  }
  if (location) {
    query.location = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(location)}$`, 'i') } };
  }

  // Exclude jobs with expired deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  query.$or = [
    { applicationDeadline: { $exists: false } },
    { applicationDeadline: null },
    { applicationDeadline: '' },
    { applicationDeadline: { $gte: today.toISOString() } }
  ];

  const jobs = await Job.find(query).sort({ postedDate: -1 });
  res.json(jobs);
}));

// Post a new job
router.post('/jobs', asyncHandler(async (req, res) => {
  const {
    jobTitle, company, companyWebsite, experienceFrom, experienceTo,
    location, contactEmail, jobArea, skills, salary,
    applicationDeadline, jobDescription, postedBy,
  } = req.body;

  if (!jobTitle || !company || !contactEmail || !jobDescription || !postedBy) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: jobTitle, company, contactEmail, jobDescription, and postedBy are required' 
    });
  }

  // Validate application deadline - should not be in the past
  if (applicationDeadline) {
    const deadline = new Date(applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    if (deadline < today) {
      return res.status(400).json({ 
        success: false,
        message: 'Application deadline cannot be in the past' 
      });
    }
  }

  const job = new Job({
    jobTitle: String(jobTitle).trim(),
    company: String(company).trim(),
    companyWebsite: companyWebsite ? String(companyWebsite).trim() : undefined,
    experienceFrom: experienceFrom !== undefined && experienceFrom !== '' ? Number(experienceFrom) : undefined,
    experienceTo: experienceTo !== undefined && experienceTo !== '' ? Number(experienceTo) : undefined,
    location: location ? normalizeToArray(location) : [],
    contactEmail: String(contactEmail).trim(),
    jobArea: jobArea ? String(jobArea).trim() : undefined,
    skills: skills ? normalizeToArray(skills) : [],
    salary: salary ? String(salary).trim() : undefined,
    applicationDeadline: applicationDeadline ? String(applicationDeadline).trim() : undefined,
    jobDescription: String(jobDescription).trim(),
    postedBy: String(postedBy).trim(),
  });

  const saved = await job.save();
  res.status(201).json({ 
    success: true,
    message: 'Job posted successfully', 
    job: saved 
  });
}));

// ---------------- INTERNSHIP ROUTES ---------------- //

// Get distinct internship companies
router.get('/internships/companies', asyncHandler(async (req, res) => {
  const names = await Internship.distinct('company');
  const clean = names.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct internship job areas
router.get('/internships/job-areas', asyncHandler(async (req, res) => {
  const areas = await Internship.distinct('jobArea');
  const clean = areas.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct internship skills
router.get('/internships/skills', asyncHandler(async (req, res) => {
  const skills = await Internship.distinct('skills');
  const clean = skills.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get distinct internship locations
router.get('/internships/locations', asyncHandler(async (req, res) => {
  const locs = await Internship.distinct('location');
  const clean = locs.map((n) => (n && String(n).trim()) || '').filter(Boolean);
  clean.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  res.json(clean);
}));

// Get all internships with filters (excluding expired ones)
router.get('/internships', asyncHandler(async (req, res) => {
  const { company, jobArea, skill, location } = req.query;
  const query = {};

  if (company) {
    query.company = { $regex: new RegExp(`^${escapeRegex(company)}$`, 'i') };
  }
  if (jobArea) {
    query.jobArea = { $regex: new RegExp(`^${escapeRegex(jobArea)}$`, 'i') };
  }
  if (skill) {
    query.skills = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(skill)}$`, 'i') } };
  }
  if (location) {
    query.location = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(location)}$`, 'i') } };
  }

  // Exclude internships with expired deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  query.$or = [
    { applicationDeadline: { $exists: false } },
    { applicationDeadline: null },
    { applicationDeadline: '' },
    { applicationDeadline: { $gte: today.toISOString() } }
  ];

  const internships = await Internship.find(query).sort({ postedDate: -1 });
  res.json(internships);
}));

// Post a new internship
router.post('/internships', asyncHandler(async (req, res) => {
  const {
    title, company, companyWebsite, duration,
    location, contactEmail, jobArea, skills, stipend,
    applicationDeadline, description, postedBy,
  } = req.body;

  if (!title || !company || !contactEmail || !description || !postedBy) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: title, company, contactEmail, description, and postedBy are required' 
    });
  }

  // Validate application deadline - should not be in the past
  if (applicationDeadline) {
    const deadline = new Date(applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    if (deadline < today) {
      return res.status(400).json({ 
        success: false,
        message: 'Application deadline cannot be in the past' 
      });
    }
  }

  const internship = new Internship({
    title: String(title).trim(),
    company: String(company).trim(),
    companyWebsite: companyWebsite ? String(companyWebsite).trim() : undefined,
    duration: duration ? String(duration).trim() : undefined,
    location: normalizeToArray(location),
    contactEmail: String(contactEmail).trim(),
    jobArea: jobArea ? String(jobArea).trim() : undefined,
    skills: normalizeToArray(skills),
    stipend: stipend ? String(stipend).trim() : undefined,
    applicationDeadline: applicationDeadline ? String(applicationDeadline).trim() : undefined,
    description: String(description).trim(),
    postedBy: String(postedBy).trim(),
  });

  const saved = await internship.save();
  res.status(201).json({ 
    success: true,
    message: 'Internship posted successfully', 
    internship: saved 
  });
}));

// Get jobs posted by a specific user
router.get('/my-jobs/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const jobs = await Job.find({ postedBy: userId }).sort({ postedDate: -1 });
  res.json(jobs);
}));

// Get internships posted by a specific user
router.get('/my-internships/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const internships = await Internship.find({ postedBy: userId }).sort({ postedDate: -1 });
  res.json(internships);
}));

// Delete a job (only if posted by the user)
router.delete('/jobs/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required' 
    });
  }

  const job = await Job.findById(jobId);
  
  if (!job) {
    return res.status(404).json({ 
      success: false,
      message: 'Job not found' 
    });
  }

  if (job.postedBy !== userId) {
    return res.status(403).json({ 
      success: false,
      message: 'You can only delete jobs posted by you' 
    });
  }

  await Job.findByIdAndDelete(jobId);
  res.json({ 
    success: true,
    message: 'Job deleted successfully' 
  });
}));

// Delete an internship (only if posted by the user)
router.delete('/internships/:internshipId', asyncHandler(async (req, res) => {
  const { internshipId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required' 
    });
  }

  const internship = await Internship.findById(internshipId);
  
  if (!internship) {
    return res.status(404).json({ 
      success: false,
      message: 'Internship not found' 
    });
  }

  if (internship.postedBy !== userId) {
    return res.status(403).json({ 
      success: false,
      message: 'You can only delete internships posted by you' 
    });
  }

  await Internship.findByIdAndDelete(internshipId);
  res.json({ 
    success: true,
    message: 'Internship deleted successfully' 
  });
}));

module.exports = router;
