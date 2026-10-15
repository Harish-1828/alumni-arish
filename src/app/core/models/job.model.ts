export interface JobPosting {
  _id?: string;
  id?: string;
  jobTitle: string;
  company: string;
  companyWebsite?: string;
  experienceFrom?: number;
  experienceTo?: number;
  location: string[];
  contactEmail: string;
  jobArea?: string;
  skills: string[];
  salary?: string;
  applicationDeadline?: string;
  jobDescription: string;
  postedDate?: string | Date;
  postedBy: string;
}

export interface InternshipPosting {
  _id?: string;
  id?: string;
  title: string;
  company: string;
  companyWebsite?: string;
  duration?: string;
  location: string[];
  contactEmail: string;
  jobArea?: string;
  skills: string[];
  stipend?: string;
  applicationDeadline?: string;
  description: string;
  postedDate?: string | Date;
  postedBy: string;
}
