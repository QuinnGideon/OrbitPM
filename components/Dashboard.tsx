import React, { useState } from 'react';
import { JobApplication, JobStatus, StageStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, CheckCircle, Briefcase, Clock, ChevronDown, Info } from './Icons';

interface DashboardProps {
  jobs: JobApplication[];
  onJobClick: (job: JobApplication) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, onJobClick }) => {
  const [isPipelineExpanded, setIsPipelineExpanded] = useState(true);

  // Metrics Calculation
  const total = jobs.length;
  const activeJobs = jobs.filter(j => j.status === JobStatus.INTERVIEWING || j.status === JobStatus.APPLIED);
  const offers = jobs.filter(j => j.status === JobStatus.OFFER).length;
  
  // Funnel Logic
  const funnelData = [
    { name: 'Applied', value: total },
    { name: 'Screening', value: jobs.filter(j => j.stages.length > 0).length },
    { name: 'Interviewing', value: jobs.filter(j => j.stages.some(s => s.type !== 'Recruiter Screen')).length },
    { name: 'Offers', value: offers },
  ];

  const statusData = [
    { name: 'Interviewing', value: jobs.filter(j => j.status === JobStatus.INTERVIEWING).length, color: '#3b82f6' }, // blue-500
    { name: 'Applied', value: jobs.filter(j => j.status === JobStatus.APPLIED).length, color: '#60a5fa' }, // blue-400
    { name: 'Offers', value: offers, color: '#22c55e' }, // green-500
    { name: 'Rejected', value: jobs.filter(j => j.status === JobStatus.REJECTED).length, color: '#ef4444' }, // red-500
    { name: 'Wishlist', value: jobs.filter(j => j.status === JobStatus.WISHLIST).length, color: '#9ca3af' }, // gray-400
  ].filter(d => d.value > 0);

  // Success Ratio
  const completedOutcomes = offers + jobs.filter(j => j.status === JobStatus.REJECTED).length;
  const successRate = completedOutcomes > 0 ? Math.round((offers / completedOutcomes) * 100) : 0;

  // Helper to get days since earliest activity
  const getDaysActive = (job: JobApplication) => {
    let earliest = new Date(job.appliedDate).getTime();
    
    // Check if any stage has an earlier date (e.g. backdated entry)
    job.stages.forEach(stage => {
      if (stage.date) {
        const stageTime = new Date(stage.date).getTime();
        if (stageTime < earliest) earliest = stageTime;
      }
    });

    const now = new Date().getTime();
    const diff = Math.floor((now - earliest) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff; // Prevent negative days if future date set by accident
  };

  // Helper to calculate earliest date (similar to above but returns formatted string for debugging if needed)
  const getEarliestDate = (job: JobApplication) => {
     let earliest = new Date(job.appliedDate).getTime();
     job.stages.forEach(stage => {
      if (stage.date) {
        const stageTime = new Date(stage.date).getTime();
        if (stageTime < earliest) earliest = stageTime;
      }
    });
    return new Date(earliest);
  }


  return (
    <div className="space-y-8 mb-8">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Pipeline</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Offers Received</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{offers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{successRate}%</p>
          </div>
        </div>
      </div>

      {/* Pipeline Health Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
        <div 
          className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700"
          onClick={() => setIsPipelineExpanded(!isPipelineExpanded)}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Pipeline Health</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-300 hidden sm:inline">Sorted by Last Activity</span>
            <ChevronDown 
              size={20} 
              className={`text-gray-400 dark:text-gray-300 transition-transform duration-200 ${isPipelineExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {isPipelineExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider">Role & Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider">Current Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider">Time Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider">Rounds Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1">
                    Velocity
                    <div className="group relative">
                      <Info size={14} className="text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        Percentage of interview rounds completed vs. total rounds.
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {activeJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                      No active applications currently.
                    </td>
                  </tr>
                ) : (
                  activeJobs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map((job) => {
                     const completedCount = job.stages.filter(s => s.status === StageStatus.COMPLETED || s.status === StageStatus.PASSED).length;
                     const totalStages = job.stages.length || 1; // Avoid div by zero
                     const progressPercent = Math.round((completedCount / totalStages) * 100);
                     const daysActive = getDaysActive(job);
                     const currentStage = job.stages.find(s => s.status === StageStatus.PENDING || s.status === StageStatus.SCHEDULED) || job.stages[job.stages.length - 1];

                     return (
                       <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-none">
                         <td className="px-6 py-4 cursor-pointer group" onClick={() => onJobClick(job)}>
                           <div className="flex items-center">
                             <div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{job.title}</div>
                               <div className="text-sm text-gray-500 dark:text-gray-400">{job.company}</div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                              {currentStage?.name || 'Application Review'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                           <div className="flex items-center gap-1.5">
                             <Clock size={14} className="text-gray-400" />
                             {daysActive} days
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                           {completedCount} / {job.stages.length}
                         </td>
                         <td className="px-6 py-4">
                           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px] overflow-hidden">
                             <div 
                                className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                           </div>
                         </td>
                       </tr>
                     );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Funnel Visualization</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1f2937', // Dark gray bg for tooltip
                    color: '#f3f4f6' // Light text
                  }}
                  itemStyle={{ color: '#f3f4f6' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#93c5fd', '#60a5fa', '#3b82f6', '#22c55e'][index] || '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Status Breakdown</h3>
          <div className="h-64 w-full relative">
              {statusData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#1f2937',
                        color: '#f3f4f6'
                      }}
                      itemStyle={{ color: '#f3f4f6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">{total}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  </div>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;