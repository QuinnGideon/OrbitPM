export enum JobStatus {
  WISHLIST = 'Wishlist',
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn',
}

export enum StageStatus {
  PENDING = 'Pending',
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  PASSED = 'Passed',
  FAILED = 'Failed',
}

export interface InterviewStage {
  id: string;
  name: string;
  date?: string; // ISO Date string
  notes?: string;
  status: StageStatus;
  type: 'Recruiter Screen' | 'Hiring Manager' | 'Technical/Case' | 'Leadership' | 'Onsite' | 'Other';
}

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  location?: string;
  source: 'Applied' | 'Recruiter Reachout' | 'Referral' | 'Other';
  compensation?: string;
  description?: string; // Short summary
  fullDescription?: string; // Full text
  interestLevel: number; // 1-5
  status: JobStatus;
  resumeVersion?: string;
  stages: InterviewStage[];
  appliedDate: string;
  lastUpdated: string;
  url?: string;
}

export interface DashboardMetrics {
  totalApplications: number;
  activeProcess: number;
  offerRate: number;
  interviewingCount: number;
}
