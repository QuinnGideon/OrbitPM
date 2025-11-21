
import React, { useState, useEffect, useMemo, Component } from 'react';
import { init, tx, id } from "@instantdb/react";
import { JobApplication, JobStatus } from './types';
import PMOrbitUI from './components/PMOrbitUI';
import { Cloud, Database, XCircle, Mail, Lock, ArrowRight, Shield } from './components/Icons';

// --- Helper for Error Messages ---
const getSafeErrorMessage = (err: any): string => {
  if (!err) return 'An unknown error occurred';
  if (typeof err === 'string') return err;
  
  // Check for InstantDB/API specific error structures
  if (err.body?.message) {
    return typeof err.body.message === 'string' 
      ? err.body.message 
      : JSON.stringify(err.body.message);
  }
  
  if (err.message) {
    return typeof err.message === 'string' 
      ? err.message 
      : JSON.stringify(err.message);
  }

  // Fallback: try to stringify the whole object
  try {
    return JSON.stringify(err, null, 2);
  } catch (e) {
    return 'An error occurred (details could not be parsed)';
  }
};

interface GlobalErrorBoundaryProps {
  children?: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// --- Global Error Boundary ---
class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
            <p className="mb-4 text-gray-300">The application encountered a critical error.</p>
            <pre className="bg-gray-800 p-4 rounded text-left overflow-auto text-xs mb-6 text-red-200 whitespace-pre-wrap">
              {getSafeErrorMessage(this.state.error)}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}

// --- Local Storage Implementation ---
const LocalApp: React.FC<{ onOpenSettings: () => void, googleClientId?: string }> = ({ onOpenSettings, googleClientId }) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Migration Logic: Check for old 'pm-orbit' data and migrate to 'pipeliner'
    const oldData = localStorage.getItem('pm-orbit-jobs');
    const saved = localStorage.getItem('pipeliner-jobs');

    if (oldData && !saved) {
      // Migrate
      try {
        setJobs(JSON.parse(oldData));
        localStorage.setItem('pipeliner-jobs', oldData);
        // Optional: localStorage.removeItem('pm-orbit-jobs'); // Keep for safety
      } catch (e) {
        console.error("Migration failed", e);
      }
    } else if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load jobs", e);
      }
    } else {
      // Seed data
      setJobs([{
        id: 'demo-1',
        title: 'Senior Software Engineer',
        company: 'Example Corp',
        status: JobStatus.WISHLIST,
        interestLevel: 3,
        appliedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: 'Applied',
        stages: []
      }]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pipeliner-jobs', JSON.stringify(jobs));
    }
  }, [jobs, isLoading]);

  const handleAdd = (job: JobApplication) => setJobs([job, ...jobs]);
  const handleUpdate = (job: JobApplication) => setJobs(jobs.map(j => j.id === job.id ? job : j));
  const handleDelete = (id: string) => setJobs(jobs.filter(j => j.id !== id));

  return (
    <PMOrbitUI
      jobs={jobs}
      isLoading={isLoading}
      isConnected={false}
      googleClientId={googleClientId}
      onAddJob={handleAdd}
      onUpdateJob={handleUpdate}
      onDeleteJob={handleDelete} 
      onOpenSettings={onOpenSettings}
    />
  );
};

// --- Login Component for InstantDB ---
const LoginScreen: React.FC<{ db: any, onBackToSettings: () => void }> = ({ db, onBackToSettings }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debugging: Log auth methods to ensure SDK is loaded correctly
  useEffect(() => {
    console.log('InstantDB Auth Methods Available:', Object.keys(db.auth || {}));
  }, [db]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await db.auth.sendMagicCode({ email: cleanEmail });
      if (step === 'email') {
        setStep('code');
      }
    } catch (err: any) {
      console.error(err);
      setError(getSafeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = code.trim();
    
    if (!cleanCode) {
      setError('Please enter the code from your email');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (typeof db.auth.signInWithMagicCode === 'function') {
        await db.auth.signInWithMagicCode({ email: cleanEmail, code: cleanCode });
      } else {
        throw new Error("SDK Error: signInWithMagicCode method not found. Please refresh.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(getSafeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-primary-600 px-8 py-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 backdrop-blur-sm">
            <Shield className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold">Pipeliner Cloud</h2>
          <p className="text-primary-100 text-sm mt-1">Sync your applications securely</p>
          
          <button 
            onClick={onBackToSettings}
            className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 break-words border border-red-100 dark:border-red-800">
              <XCircle size={16} className="flex-shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Send Magic Code'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <form onSubmit={handleVerifyCode}>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Code sent to <span className="font-medium text-gray-900 dark:text-white">{email}</span></p>
                  <button 
                    type="button" 
                    onClick={() => {
                      setError('');
                      setStep('email');
                    }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
                  >
                    Change email
                  </button>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Magic Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-lg tracking-wider text-gray-900 dark:text-white"
                      placeholder="123456"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isSubmitting ? 'Verifying...' : 'Verify & Login'} <ArrowRight size={18} />
                </button>
              </form>
              
              <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSubmitting}
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-800 dark:hover:text-primary-300 disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- InstantDB Implementation ---
const InstantDBApp: React.FC<{ appId: string, onOpenSettings: () => void, googleClientId?: string }> = ({ appId, onOpenSettings, googleClientId }) => {
  // Initialize DB
  const db = useMemo(() => init({ appId }), [appId]);
  
  const { isLoading: authLoading, user, error: authError } = db.useAuth();
  
  // Query all jobs. In a real app, you would use permissions or filters in the query.
  const { isLoading: dataLoading, error: dataError, data } = db.useQuery({ jobs: {} });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="text-primary-600 font-medium text-sm">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (authError || dataError) {
    const errorMsg = getSafeErrorMessage(authError || dataError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-600 p-4 transition-colors duration-200">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2 dark:text-red-400">
             <XCircle /> Connection Error
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            {errorMsg.toLowerCase().includes('permission') && (
               <div className="text-xs text-left bg-gray-100 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                 <strong>Tip:</strong> If you see a permission error, ensure your InstantDB <code>rules.json</code> allows read/write. For development, you can use:
                 <pre className="mt-1 bg-gray-800 text-white p-1 rounded overflow-x-auto">
                   {`{ "jobs": { "allow": { "view": "true", "create": "true", "update": "true", "delete": "true" } } }`}
                 </pre>
               </div>
            )}
            <button onClick={onOpenSettings} className="mt-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 py-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-sm font-medium">
               Check App ID Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen db={db} onBackToSettings={onOpenSettings} />;
  }

  // Filter jobs locally by user ID to ensure they only see their own
  const allJobs = data ? Object.values(data.jobs || {}) as JobApplication[] : [];
  const userJobs = allJobs.filter((j: any) => j.userId === user.id);

  const handleAdd = (job: JobApplication) => {
    // Attach userId to the job record
    db.transact(tx.jobs[job.id].update({ ...job, userId: user.id }));
  };

  const handleUpdate = (job: JobApplication) => {
    // Fix: Spread job object to satisfy InstantDB update type requirements
    db.transact(tx.jobs[job.id].update({ ...job }));
  };

  const handleDelete = (jobId: string) => {
    db.transact(tx.jobs[jobId].delete());
  };

  const handleLogout = () => {
    db.auth.signOut();
  };

  return (
    <PMOrbitUI
      jobs={userJobs}
      isLoading={dataLoading}
      isConnected={true}
      userEmail={user.email}
      googleClientId={googleClientId}
      onAddJob={handleAdd}
      onUpdateJob={handleUpdate}
      onDeleteJob={handleDelete}
      onOpenSettings={onOpenSettings}
      onLogout={handleLogout}
    />
  );
};

// --- Main App Controller ---
const App: React.FC = () => {
  const [dbAppId, setDbAppId] = useState<string | null>(localStorage.getItem('instantdb-id'));
  const [googleClientId, setGoogleClientId] = useState<string | undefined>(localStorage.getItem('google-client-id') || undefined);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputAppId, setInputAppId] = useState(dbAppId || '');
  const [inputGoogleClientId, setInputGoogleClientId] = useState(googleClientId || '');

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSaveSettings = () => {
    const trimmedId = inputAppId.trim();
    const trimmedGoogleId = inputGoogleClientId.trim();

    if (trimmedId) {
      localStorage.setItem('instantdb-id', trimmedId);
      setDbAppId(trimmedId);
    } else {
      localStorage.removeItem('instantdb-id');
      setDbAppId(null);
    }

    if (trimmedGoogleId) {
      localStorage.setItem('google-client-id', trimmedGoogleId);
      setGoogleClientId(trimmedGoogleId);
    } else {
      localStorage.removeItem('google-client-id');
      setGoogleClientId(undefined);
    }

    setIsSettingsOpen(false);
  };

  return (
    <GlobalErrorBoundary>
      {dbAppId ? (
        <InstantDBApp appId={dbAppId} googleClientId={googleClientId} onOpenSettings={() => setIsSettingsOpen(true)} />
      ) : (
        <LocalApp googleClientId={googleClientId} onOpenSettings={() => setIsSettingsOpen(true)} />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <Database className="text-primary-600 dark:text-primary-400" size={24} />
                 Data Settings
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* InstantDB Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">InstantDB App ID</label>
                <input 
                  type="text" 
                  value={inputAppId}
                  onChange={(e) => setInputAppId(e.target.value)}
                  placeholder="e.g. 29a1c..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enable cloud sync across devices.</p>
              </div>

              {/* Google Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Client ID (Gmail)</label>
                <input 
                  type="text" 
                  value={inputGoogleClientId}
                  onChange={(e) => setInputGoogleClientId(e.target.value)}
                  placeholder="e.g. 123...apps.googleusercontent.com"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono text-gray-900 dark:text-white"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enable "Inbox Insights" to scan emails for interview updates.</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                 <p className="font-semibold mb-1">Setup Guide</p>
                 <p className="text-xs">Check the <a href="#" className="underline font-bold">README</a> for instructions on how to generate these IDs.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
               <button 
                 onClick={() => setIsSettingsOpen(false)}
                 className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveSettings}
                 className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm"
               >
                 Save Configuration
               </button>
            </div>
          </div>
        </div>
      )}
    </GlobalErrorBoundary>
  );
};

export default App;
