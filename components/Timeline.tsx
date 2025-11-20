import React, { useState } from 'react';
import { InterviewStage, StageStatus } from '../types';
import { CheckCircle, Clock, XCircle, Calendar, Trash2, Plus, MessageSquare, StickyNote } from './Icons';

interface TimelineProps {
  stages: InterviewStage[];
  onUpdateStages: (stages: InterviewStage[]) => void;
}

const Timeline: React.FC<TimelineProps> = ({ stages, onUpdateStages }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNotes = (id: string) => {
    const newSet = new Set(expandedNotes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedNotes(newSet);
  };

  const sortStages = (items: InterviewStage[]) => {
    return [...items].sort((a, b) => {
      // Sort by date ascending. If no date, put at the end.
      const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  };

  const handleStatusChange = (id: string, newStatus: StageStatus) => {
    const updated = stages.map(s => s.id === id ? { ...s, status: newStatus } : s);
    onUpdateStages(updated);
  };

  const handleDateChange = (id: string, date: string) => {
    const updated = stages.map(s => s.id === id ? { ...s, date } : s);
    // Auto-sort when dates change
    onUpdateStages(sortStages(updated));
  };

  const handleNotesChange = (id: string, notes: string) => {
    const updated = stages.map(s => s.id === id ? { ...s, notes } : s);
    onUpdateStages(updated);
  };

  const handleDelete = (id: string) => {
    const updated = stages.filter(s => s.id !== id);
    onUpdateStages(updated);
  };

  const handleAddStage = () => {
    const newStage: InterviewStage = {
      id: Date.now().toString(),
      name: 'New Round',
      status: StageStatus.PENDING,
      type: 'Other',
      date: new Date().toISOString().split('T')[0]
    };
    // Add and sort immediately
    onUpdateStages(sortStages([...stages, newStage]));
    setEditingId(newStage.id);
  };

  const getStatusColor = (status: StageStatus) => {
    switch (status) {
      case StageStatus.COMPLETED:
      case StageStatus.PASSED: return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400';
      case StageStatus.FAILED: return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400';
      case StageStatus.SCHEDULED: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400';
      default: return 'text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-700/30 dark:border-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case StageStatus.PASSED:
      case StageStatus.COMPLETED: return <CheckCircle size={16} />;
      case StageStatus.FAILED: return <XCircle size={16} />;
      case StageStatus.SCHEDULED: return <Calendar size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Interview Timeline</h3>
        <button 
          onClick={handleAddStage}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <Plus size={16} /> Add Round
        </button>
      </div>

      <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative group">
            {/* Dot on the line */}
            <div className={`absolute -left-[21px] top-4 h-4 w-4 rounded-full border-2 bg-white dark:bg-gray-800 ${
              stage.status === StageStatus.PASSED ? 'border-green-500' : 
              stage.status === StageStatus.FAILED ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}></div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition hover:shadow-md overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {editingId === stage.id ? (
                      <input 
                        type="text" 
                        value={stage.name}
                        onChange={(e) => {
                          const updated = stages.map(s => s.id === stage.id ? { ...s, name: e.target.value } : s);
                          onUpdateStages(updated);
                        }}
                        onBlur={() => setEditingId(null)}
                        className="font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500"
                        autoFocus
                      />
                    ) : (
                      <h4 
                        className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setEditingId(stage.id)}
                      >
                        {stage.name}
                      </h4>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(stage.status)}`}>
                      {getStatusIcon(stage.status)}
                      {stage.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stage.type}</p>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="date"
                    value={stage.date ? stage.date.split('T')[0] : ''}
                    onChange={(e) => handleDateChange(stage.id, e.target.value)}
                    className="text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none shadow-sm"
                  />
                  
                  <select 
                    value={stage.status}
                    onChange={(e) => handleStatusChange(stage.id, e.target.value as StageStatus)}
                    className="text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-gray-900 shadow-sm"
                  >
                    {Object.values(StageStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-2 gap-2">
                    <button
                      onClick={() => toggleNotes(stage.id)}
                      className={`transition-colors ${expandedNotes.has(stage.id) || stage.notes ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      title="Toggle Notes"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(stage.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Round"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notes Section */}
              {(expandedNotes.has(stage.id) || stage.notes) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2 items-start">
                    <StickyNote size={14} className="text-gray-400 mt-1.5 flex-shrink-0" />
                    <textarea
                      value={stage.notes || ''}
                      onChange={(e) => handleNotesChange(stage.id, e.target.value)}
                      placeholder="Add notes, interview feedback, or key takeaways here..."
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-y min-h-[60px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {stages.length === 0 && (
          <div className="text-gray-400 dark:text-gray-500 italic text-sm ml-2">No interview rounds added yet.</div>
        )}
      </div>
    </div>
  );
};

export default Timeline;