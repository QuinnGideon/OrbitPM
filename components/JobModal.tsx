import React, { useState, useEffect } from 'react';
import { JobApplication, JobStatus } from '../types';
import Timeline from './Timeline';
import { XCircle, Trash2, ExternalLink, Flame, AlertCircle } from './Icons';

interface JobModalProps {
  job: JobApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, isOpen, onClose, onUpdate, onDelete }) => {
  const [editedJob, setEditedJob] = useState<JobApplication>(job);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setEditedJob(job);
    setShowConfirmDelete(false);
  }, [job]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(editedJob);
    onClose();
  };

  const handleInterestChange = (level: number) => {
    setEditedJob({ ...editedJob, interestLevel: level });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-start">
          <div className="w-full mr-4">
            <input 
              type="text" 
              value={editedJob.title}
              onChange={(e) => setEditedJob({...editedJob, title: e.target.value})}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none w-full placeholder-gray-400"
            />
            <input 
              type="text" 
              value={editedJob.company}
              onChange={(e) => setEditedJob({...editedJob, company: e.target.value})}
              className="text-lg font-medium text-gray-600 dark:text-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none w-full placeholder-gray-400"
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XCircle size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={editedJob.status}
                  onChange={(e) => setEditedJob({...editedJob, status: e.target.value as JobStatus})}
                  className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                >
                  {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Interest Level</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button 
                      key={level}
                      onClick={() => handleInterestChange(level)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Flame 
                        size={24} 
                        fill={level <= editedJob.interestLevel ? "#f97316" : "none"} 
                        className={level <= editedJob.interestLevel ? "text-orange-500" : "text-gray-300 dark:text-gray-600"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                 <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Source</label>
                 <select 
                  value={editedJob.source}
                  onChange={(e) => setEditedJob({...editedJob, source: e.target.value as any})}
                  className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none shadow-sm"
                >
                  <option>Applied</option>
                  <option>Recruiter Reachout</option>
                  <option>Referral</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Compensation</label>
                <input 
                  type="text" 
                  value={editedJob.compensation || ''}
                  onChange={(e) => setEditedJob({...editedJob, compensation: e.target.value})}
                  placeholder="e.g. $180k - $220k + Equity"
                  className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Resume Submitted</label>
                <input 
                  type="text" 
                  value={editedJob.resumeVersion || ''}
                  onChange={(e) => setEditedJob({...editedJob, resumeVersion: e.target.value})}
                  placeholder="e.g. PM_Tech_v2.pdf"
                  className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-colors shadow-sm"
                />
              </div>
              
               <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Job URL</label>
                <div className="flex gap-2">
                   <input 
                    type="text" 
                    value={editedJob.url || ''}
                    onChange={(e) => setEditedJob({...editedJob, url: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-colors shadow-sm"
                  />
                  {editedJob.url && (
                    <a href={editedJob.url} target="_blank" rel="noreferrer" className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg">
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
             <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description / Notes</label>
             <textarea 
               value={editedJob.description || ''}
               onChange={(e) => setEditedJob({...editedJob, description: e.target.value})}
               className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white h-32 resize-none outline-none focus:border-primary-500 shadow-sm"
               placeholder="Brief summary of the role..."
             />
          </div>

          {/* Timeline */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
             <Timeline 
               stages={editedJob.stages} 
               onUpdateStages={(stages) => setEditedJob({...editedJob, stages})}
             />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-b-2xl">
          {!showConfirmDelete ? (
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Application
            </button>
          ) : (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Are you sure?</span>
              <button 
                onClick={() => onDelete(job.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="text-gray-500 dark:text-gray-400 text-sm px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave}
               className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95"
             >
               Save Changes
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobModal;