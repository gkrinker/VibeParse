import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const proficiencies = ['beginner', 'intermediate', 'advanced'];
const depths = ['key-parts', 'full'];
const fileTypes = ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.go', '.rb'];

// Utility to get API base URL
const getApiUrl = (path: string) => {
  const base = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

const IndexPage: React.FC = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [proficiency, setProficiency] = useState('beginner');
  const [depth, setDepth] = useState('key-parts');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileTypeChange = (type: string) => {
    setSelectedFileTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl('/api/generate-script'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: githubUrl,
          proficiency,
          depth,
          file_types: selectedFileTypes.length > 0 ? selectedFileTypes : undefined,
          save_to_disk: true
        })
      });
      if (!response.ok) throw new Error('Failed to generate script');
      const data = await response.json();
      navigate(`/player/${data.script_id}`);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center h-screen">
        <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-4">Generate Code Explanation Script</h1>
          <label className="block mb-2">GitHub URL</label>
          <input
            className="w-full p-2 border rounded mb-4"
            type="text"
            value={githubUrl}
            onChange={e => setGithubUrl(e.target.value)}
            required
          />
          <label className="block mb-2">Proficiency</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={proficiency}
            onChange={e => setProficiency(e.target.value)}
          >
            {proficiencies.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <label className="block mb-2">Depth</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={depth}
            onChange={e => setDepth(e.target.value)}
          >
            {depths.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="block mb-2">File Types</label>
          <div className="flex flex-wrap mb-4">
            {fileTypes.map(type => (
              <label key={type} className="mr-4 mb-2 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFileTypes.includes(type)}
                  onChange={() => handleFileTypeChange(type)}
                  className="mr-1"
                />
                {type}
              </label>
            ))}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </form>
      </div>
    </>
  );
};

export default IndexPage; 