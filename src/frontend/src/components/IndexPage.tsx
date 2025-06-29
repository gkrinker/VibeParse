import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const getApiUrl = (path: string) => {
  const base = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

// Simple Dropdown Component
interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: string;
  placeholder?: string;
  dropdownClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ value, options, onChange, icon, placeholder, dropdownClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-sm font-medium gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[7rem] whitespace-nowrap"
      >
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 text-neutral-500">{icon}</span>
          <span>{value}</span>
        </div>
        <span className="w-4 h-4">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 bg-white border border-neutral-200 rounded-lg shadow min-w-full">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`text-left px-4 py-2 text-sm hover:bg-neutral-100 w-full ${
                index === 0 ? 'rounded-t-lg' : index === options.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'file' | 'changes'>('file');
  const [githubUrl, setGithubUrl] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [depth, setDepth] = useState('Key Parts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const [mockMode, setMockMode] = useState<boolean | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Check mock mode status on component mount
  useEffect(() => {
    const checkMockMode = async () => {
      try {
        const response = await fetch(getApiUrl('/api/config'));
        if (response.ok) {
          const config = await response.json();
          setMockMode(config.mock_llm_mode);
        }
      } catch (err) {
        console.warn('Failed to fetch config:', err);
        setMockMode(false);
      } finally {
        setConfigLoading(false);
      }
    };
    checkMockMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'changes') {
      setError('Explaining recent changes is not yet supported.');
      return;
    }
    if (!githubUrl.trim() && !mockMode) {
      setError('GitHub URL is required.');
      return;
    }
    setLoading(true);
    setError(null);
    console.log(`[USER] New user started generation for ${githubUrl} and has e-mail ${email}`);
    try {
      const response = await fetch(getApiUrl('/api/generate-script'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: githubUrl || (mockMode ? 'https://github.com/mock/repo' : ''),
          proficiency: proficiency.toLowerCase(),
          depth: depth.toLowerCase().replace(' ', '-'),
          save_to_disk: true,
          email
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to generate script');
      }
      const data = await response.json();
      navigate(`/player/${data.script_id}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-neutral-900 font-inter selection:bg-indigo-500 selection:text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="tracking-tight text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Vibe<span className="text-indigo-600">Parse</span>
          </a>
          <button aria-label="Toggle navigation" className="md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <span className="w-6 h-6 block">☰</span>
          </button>
        </div>
      </header>

      {/* Mock Mode Banner */}
      {mockMode === true && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="text-yellow-600">🎭</span>
            <span className="text-sm font-medium text-yellow-800">
              Mock Mode Active - Using test data instead of real API calls
            </span>
            <span className="text-yellow-600">🎭</span>
          </div>
        </div>
      )}
      


      {/* HERO */}
      <section className="relative isolate pb-4 sm:pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-[-30%] h-[100vh] bg-gradient-to-b from-indigo-100 via-white to-white"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:pt-24 pt-20 w-full max-w-full">
          <h1 className="text-center w-full whitespace-nowrap text-[clamp(1.25rem,8vw,2.5rem)] font-semibold tracking-tight mb-6">
            Understand&nbsp;
            <span className="font-mono text-indigo-600 whitespace-nowrap">&lt;Code&gt;</span>
            &nbsp;Faster
          </h1>
          <p className="text-center text-lg text-neutral-600 max-w-3xl mx-auto mb-10">
            Drop any GitHub link and get an AI-crafted walkthrough that turns complex code into clear, bite-sized explanations.
          </p>

          {/* Tab Navigation */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-1 relative z-10 items-start" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'file'}
                onClick={() => setActiveTab('file')}
                className={`flex-none relative px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center gap-2 rounded-t-lg border-t border-l border-r focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition whitespace-nowrap z-20 ${
                  activeTab === 'file'
                    ? 'border-neutral-200 bg-white text-neutral-900 -mb-1 border-b-2 border-b-white'
                    : 'border-neutral-300 bg-neutral-100 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 mb-0 border-b-0'
                }`}
              >
                <span className="w-4 h-4">📁</span>
                Explain&nbsp;File/Directory
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'changes'}
                onClick={() => {
                  setShowComingSoonDialog(true);
                }}
                className={`flex-none relative px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center gap-2 rounded-t-lg border-t border-l border-r focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition whitespace-nowrap z-10 ${
                activeTab === 'changes'
                  ? 'border-neutral-200 bg-white text-neutral-900 -mb-px'
                  : 'border-neutral-300 bg-neutral-100 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 mb-0 border-b-0'
              }`}
              >
                <span className="w-4 h-4">🔄</span>
                <span className="hidden sm:inline">Explain&nbsp;Recent&nbsp;Changes</span>
                <span className="sm:hidden">Explain&nbsp;Changes</span>
              </button>
            </div>

            {/* Main Container */}
            <div className="bg-white/60 backdrop-blur-lg border border-neutral-200 border-t border-neutral-200 rounded-2xl rounded-tl-none shadow-lg p-8 sm:p-10 space-y-6 max-w-2xl mx-auto">

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="github-link" className="sr-only">GitHub URL</label>
                  <div className="relative">
                    <input
                      id="github-link"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder={mockMode ? "GitHub URL (optional in mock mode)" : "Paste a Github link to a file or folder..."}
                      className="w-full bg-neutral-50 placeholder-neutral-400 border border-neutral-200 text-neutral-900 text-sm rounded-lg px-4 py-3 pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="w-4 h-4 text-neutral-400">🔗</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">Email (optional)</label>
                  <div className="relative mt-3">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email to get a link to your lesson (optional)"
                      className="w-full bg-neutral-50 placeholder-neutral-400 border border-neutral-200 text-neutral-900 text-sm rounded-lg px-4 py-3 pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="w-4 h-4 text-neutral-400">✉️</span>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full text-xs sm:text-sm">
                    <div className="flex-1 flex gap-3 w-full">
                      <Dropdown
                        value={proficiency}
                        options={['Beginner', 'Intermediate', 'Advanced']}
                        onChange={setProficiency}
                        icon="🎓"
                        dropdownClassName="px-3 py-2 sm:px-4 sm:py-3"
                      />
                      <Dropdown
                        value={depth}
                        options={['Key Parts', 'Full Explanation', 'Concise Summary']}
                        onChange={setDepth}
                        icon="📚"
                        dropdownClassName="px-3 py-2 sm:px-4 sm:py-3"
                      />
                    </div>
                    <button
                      id="generate-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto sm:ml-auto px-3 py-2 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-semibold flex items-center justify-center gap-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4">✨</span>
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <pre
                    id="response-box"
                    aria-live="polite"
                    className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap text-red-700"
                  >{error}</pre>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 pt-4 sm:pt-8 pb-4 sm:pb-16 mb-4 sm:mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-6 sm:mb-12">
          How&nbsp;it&nbsp;Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center mx-auto">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-sm leading-relaxed">Paste a GitHub link and pick your learning mode.</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center mx-auto">
              <span className="text-3xl">⚙️</span>
            </div>
            <p className="text-sm leading-relaxed">Adjust proficiency & output depth for a tailored lesson.</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center mx-auto">
              <span className="text-3xl">✨</span>
            </div>
            <p className="text-sm leading-relaxed">Receive an instant, digestible explanation—shareable too!</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs text-neutral-500 py-8 border-t border-neutral-200 mt-8">
        © {new Date().getFullYear()} Vibe<span className="text-indigo-600">Parse</span>. Built with love.
      </footer>

      {/* Coming Soon Dialog */}
      {showComingSoonDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Coming Soon!
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                The "Explain Recent Changes" feature is currently in development. 
                Stay tuned for updates as we work to bring you Git diff explanations!
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowComingSoonDialog(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPage; 