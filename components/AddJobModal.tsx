import React, { useState } from 'react';
import { JobApplication, JobStatus, StageStatus } from '../types';
import { parseJobDescription } from '../services/geminiService';
import { Briefcase, MapPin, FileText, DollarSign, ExternalLink } from './Icons';
import { id } from '@instantdb/react';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: JobApplication) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'smart'>('smart');
  const [isLoading, setIsLoading] = useState(false);
  const [smartText, setSmartText] = useState('');
  
  // Manual Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSmartSubmit = async () => {
    if (!smartText.trim()) return;
    setIsLoading(true);
    try {
      const data = await parseJobDescription(smartText);
      
      const newJob: JobApplication = {
        id: id(), // Use InstantDB's UUID generator
        title: data.title || 'Unknown Role',
        company: data.company || 'Unknown Company',
        location: data.location || '',
        compensation: data.compensation || '',
        description: data.summary || '',
        fullDescription: smartText,
        source: 'Applied',
        status: JobStatus.WISHLIST,
        interestLevel: 3,
        appliedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        url: url, // If user pasted URL separately, or extracted
        resumeVersion: 'Default',
        stages: (data.suggestedStages || []).map((stageName: string, idx: number) => ({
          id: id(), // Generate unique UUIDs for stages
          name: stageName,
          status: StageStatus.PENDING,
          type: idx === 0 ? 'Recruiter Screen' : 'Other',
          date: undefined
        }))
      };

      onAdd(newJob);
      resetAndClose();
    } catch (error) {
      alert('Failed to parse job. Please try manual entry.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!title || !company) return;
    const newJob: JobApplication = {
      id: id(), // Use InstantDB's UUID generator
      title,
      company,
      source: 'Applied',
      status: JobStatus.APPLIED,
      interestLevel: 3,
      appliedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      url,
      resumeVersion: 'Default',
      stages: [],
      description: ''
    };
    onAdd(newJob);
    resetAndClose();
  };

  const resetAndClose = () => {
    setSmartText('');
    setTitle('');
    setCompany('');
    setUrl('');
    setMode('smart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Track New Opportunity</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a new role to your orbit.</p>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
             <button 
               onClick={() => setMode('smart')}
               className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${mode === 'smart' ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
             >
               ✨ Smart Paste
             </button>
             <button 
               onClick={() => setMode('manual')}
               className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${mode === 'manual' ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
             >
               ✍️ Manual Entry
             </button>
          </div>

          {mode === 'smart' ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paste Job Description or Content
                <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                  Gemini will extract the Company, Title, Salary, and suggest Interview Rounds automatically.
                </span>
              </label>
              <textarea 
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                className="w-full h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm text-gray-900 dark:text-white shadow-sm placeholder-gray-400"
                placeholder="Paste the full job description text here..."
              ></textarea>
               <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Job URL (Optional)"
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-900 dark:text-white shadow-sm placeholder-gray-400"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full pl-10 p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Product Manager"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Company</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-10 p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Job URL (Optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={mode === 'smart' ? handleSmartSubmit : handleManualSubmit}
            disabled={isLoading || (mode === 'smart' && !smartText) || (mode === 'manual' && (!title || !company))}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              'Add to Orbit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;