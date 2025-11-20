import React, { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import Dashboard from './Dashboard';
import JobCard from './JobCard';
import JobModal from './JobModal';
import AddJobModal from './AddJobModal';
import CalendarView from './CalendarView';
import { Layout, Plus, Search, ListFilter, ArrowUpDown, Database, Cloud, Settings, LogOut, Shield, Sun, Moon, Calendar } from './Icons';

type SortOption = 'updated' | 'applied_newest' | 'applied_oldest' | 'company' | 'interest' | 'status';

interface PMOrbitUIProps {
  jobs: JobApplication[];
  isLoading: boolean;
  isConnected: boolean;
  userEmail?: string;
  onAddJob: (job: JobApplication) => void;
  onUpdateJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

const PMOrbitUI: React.FC<PMOrbitUIProps> = ({ 
  jobs, 
  isLoading, 
  isConnected,
  userEmail,
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onOpenSettings,
  onLogout
}) => {
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState<'board' | 'dashboard' | 'calendar'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleUpdateJob = (updatedJob: JobApplication) => {
    onUpdateJob(updatedJob);
    if (selectedJob?.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
  };

  const handleDeleteJob = (id: string) => {
    onDeleteJob(id);
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    return job.company.toLowerCase().includes(query) || job.title.toLowerCase().includes(query);
  });

  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    switch (sortOption) {
      case 'company':
        return a.company.localeCompare(b.company);
      case 'interest':
        return b.interestLevel - a.interestLevel;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'applied_newest':
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      case 'applied_oldest':
        return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
      case 'updated':
      default:
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your orbit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-primary-200 dark:shadow-none shadow-lg">
            <Layout size={22} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 hidden sm:block">
            PM Orbit
          </h1>
          
          <div className="hidden md:flex items-center ml-4 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700 transition-colors">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {isConnected ? <Cloud size={14} /> : <Database size={14} />}
              {isConnected ? 'Cloud Sync' : 'Local Storage'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative hidden md:block">
             <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
             <input 
              type="text" 
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 border focus:border-primary-300 dark:focus:border-primary-500 rounded-lg text-sm w-56 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
             />
           </div>

           <button 
             onClick={toggleTheme}
             className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
           >
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
           </button>

           {userEmail && (
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium border border-primary-100 dark:border-primary-800">
               <Shield size={14} />
               <span className="max-w-[150px] truncate" title={userEmail}>{userEmail}</span>
             </div>
           )}

           {isConnected && onLogout && (
             <button 
               onClick={onLogout}
               className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
               title="Log Out"
             >
               <LogOut size={20} />
             </button>
           )}

           <button 
             onClick={onOpenSettings}
             className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             title="Data Settings"
           >
             <Settings size={20} />
           </button>

           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
             <button 
               onClick={() => setView('board')}
               className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'board' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
               Board
             </button>
             <button 
               onClick={() => setView('calendar')}
               className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${view === 'calendar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
               Calendar
             </button>
             <button 
               onClick={() => setView('dashboard')}
               className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
               Metrics
             </button>
           </div>

           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-lg shadow-primary-200 dark:shadow-none transition-transform active:scale-95 flex items-center gap-2"
           >
             <Plus size={18} />
             <span className="hidden sm:inline">New Role</span>
           </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {view === 'dashboard' && <Dashboard jobs={jobs} onJobClick={setSelectedJob} />}

        {view === 'calendar' && <CalendarView jobs={jobs} onJobClick={setSelectedJob} />}

        {view === 'board' && (
          <>
             <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Active Applications</h2>
                 <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage your pipeline and track progress.</p>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="text-sm text-gray-400 dark:text-gray-500 font-medium hidden sm:block">
                   {sortedFilteredJobs.length} Roles
                 </div>
                 
                 {/* Sorting Dropdown */}
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <option value="updated">Last Updated</option>
                      <option value="applied_newest">Newest Applied</option>
                      <option value="applied_oldest">Oldest Applied</option>
                      <option value="company">Company (A-Z)</option>
                      <option value="status">Status</option>
                      <option value="interest">Interest (High-Low)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <ListFilter className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    </div>
                 </div>
               </div>
             </div>

             {sortedFilteredJobs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 transition-colors">
                 <p>No applications found matching your criteria.</p>
                 <button onClick={() => setIsAddModalOpen(true)} className="mt-2 text-primary-600 dark:text-primary-400 font-medium hover:underline">Add your first role</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {sortedFilteredJobs.map(job => (
                   <JobCard 
                     key={job.id} 
                     job={job} 
                     onClick={() => setSelectedJob(job)} 
                   />
                 ))}
               </div>
             )}
          </>
        )}

      </main>

      {/* Modals */}
      <AddJobModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddJob}
      />

      {selectedJob && (
        <JobModal 
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
        />
      )}

    </div>
  );
};

export default PMOrbitUI;