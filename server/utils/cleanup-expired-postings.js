/**
 * Cleanup Script for Expired Job and Internship Postings
 * 
 * This script removes job and internship postings that have passed their application deadline.
 * 
 * Usage:
 * 1. Run manually: node utils/cleanup-expired-postings.js
 * 2. Set up as a cron job to run daily (recommended)
 * 
 * Cron job example (run daily at 2 AM):
 * 0 2 * * * cd /path/to/server && node utils/cleanup-expired-postings.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load database config
const dbConfig = require('../config/database');

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
  postedBy: { type: String, required: true },
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
  postedBy: { type: String, required: true },
});

const Job = mongoose.model('Job', jobSchema, 'jobposts');
const Internship = mongoose.model('Internship', internshipSchema, 'internships');

async function cleanupExpiredPostings() {
  try {
    console.log('🔍 Starting cleanup of expired postings...');
    console.log(`📅 Current date: ${new Date().toISOString()}`);
    
    // Connect to database
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('✅ Connected to database');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Find and delete expired jobs
    const expiredJobsQuery = {
      applicationDeadline: { 
        $exists: true, 
        $ne: null, 
        $ne: '', 
        $lt: todayISO 
      }
    };

    const expiredJobs = await Job.find(expiredJobsQuery);
    console.log(`\n📋 Found ${expiredJobs.length} expired job(s)`);
    
    if (expiredJobs.length > 0) {
      console.log('Expired jobs:');
      expiredJobs.forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.jobTitle} at ${job.company} (Deadline: ${job.applicationDeadline})`);
      });
      
      const deletedJobs = await Job.deleteMany(expiredJobsQuery);
      console.log(`✅ Deleted ${deletedJobs.deletedCount} expired job(s)`);
    }

    // Find and delete expired internships
    const expiredInternsQuery = {
      applicationDeadline: { 
        $exists: true, 
        $ne: null, 
        $ne: '', 
        $lt: todayISO 
      }
    };

    const expiredInterns = await Internship.find(expiredInternsQuery);
    console.log(`\n📋 Found ${expiredInterns.length} expired internship(s)`);
    
    if (expiredInterns.length > 0) {
      console.log('Expired internships:');
      expiredInterns.forEach((intern, index) => {
        console.log(`  ${index + 1}. ${intern.title} at ${intern.company} (Deadline: ${intern.applicationDeadline})`);
      });
      
      const deletedInterns = await Internship.deleteMany(expiredInternsQuery);
      console.log(`✅ Deleted ${deletedInterns.deletedCount} expired internship(s)`);
    }

    console.log('\n🎉 Cleanup completed successfully!');
    
    // Log summary
    const totalDeleted = (expiredJobs.length || 0) + (expiredInterns.length || 0);
    if (totalDeleted === 0) {
      console.log('ℹ️  No expired postings found.');
    } else {
      console.log(`📊 Total postings removed: ${totalDeleted}`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the cleanup
cleanupExpiredPostings();
