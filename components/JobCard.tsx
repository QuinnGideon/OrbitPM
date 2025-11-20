import React from 'react';
import { JobApplication, JobStatus, StageStatus } from '../types';
import { MapPin, DollarSign, Flame, Calendar, FileText } from './Icons';

interface JobCardProps {
  job: JobApplication;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  // Calculate progress
  const totalStages = job.stages.length;
  const completedStages = job.stages.filter(s => 
    s.status === StageStatus.COMPLETED || s.status === StageStatus.PASSED
  ).length;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  // Get next round
  const nextStage = job.stages.find(s => 
    s.status === StageStatus.SCHEDULED || s.status === StageStatus.PENDING
  );

  const getStatusBadge = (status: JobStatus) => {
    const styles = {
      [JobStatus.APPLIED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      [JobStatus.INTERVIEWING]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      [JobStatus.OFFER]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      [JobStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      [JobStatus.WISHLIST]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      [JobStatus.WITHDRAWN]: 'bg-gray-100 text-gray-600 line-through dark:bg-gray-700 dark:text-gray-400',
    };
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  // Format date string (YYYY-MM-DD) safely without timezone shifts
  const formatStageDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    // Handle YYYY-MM-DD specifically
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Create date at noon to avoid any midnight timezone shifting weirdness
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
    }
    
    // Fallback for full ISO strings
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           {getStatusBadge(job.status)}
           <div className="flex text-orange-500 gap-0.5" title={`Interest: ${job.interestLevel}/5`}>
             {[...Array(5)].map((_, i) => (
               <Flame 
                 key={i} 
                 size={14} 
                 fill={i < job.interestLevel ? "currentColor" : "none"} 
                 className={i < job.interestLevel ? "text-orange-500" : "text-gray-200 dark:text-gray-600"}
               />
             ))}
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin size={14} /> {job.location}
          </div>
        )}
        {job.compensation && (
          <div className="flex items-center gap-1">
            <DollarSign size={14} /> {job.compensation}
          </div>
        )}
        {job.resumeVersion && (
           <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 rounded text-xs">
           <FileText size={12} /> {job.resumeVersion}
         </div>
        )}
      </div>

      {/* Timeline Mini Viz */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{completedStages}/{totalStages} Rds</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {nextStage && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar size={14} className="text-primary-500" />
            <span className="font-medium">Next: {nextStage.name}</span>
          </div>
          {nextStage.date && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
               {formatStageDate(nextStage.date)}
            </span>
          )}
        </div>
      )}
      
      {!nextStage && job.status === JobStatus.INTERVIEWING && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-400 italic">
          No upcoming rounds scheduled.
        </div>
      )}
    </div>
  );
};

export default JobCard;