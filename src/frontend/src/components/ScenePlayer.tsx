import React, { useState, useEffect, useRef } from 'react';
import { Scene, Script } from '../types/script';
import CodeDisplay from './CodeDisplay';

interface ScenePlayerProps {
  scene: Scene;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  script: Script;
  currentSceneIndex: number;
  setCurrentSceneIndex: (idx: number) => void;
}

const ScenePlayer: React.FC<ScenePlayerProps> = ({
  scene,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  script,
  currentSceneIndex,
  setCurrentSceneIndex
}) => {
  const [tocOpen, setTocOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Click-away listener
  useEffect(() => {
    if (!tocOpen) return;
    function handleClick(event: MouseEvent) {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setTocOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [tocOpen]);

  const progress = ((currentSceneIndex + 1) / script.scenes.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-300">
        <div className="h-2 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {/* Header (scene title/content) */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">{scene.title}</h1>
        <p className="text-gray-600 mt-2">{scene.content}</p>
      </div>
      {/* Main Content */}
      {scene.code_highlights.length === 0 ? (
        <div className="p-4">
          <div className="text-gray-500 italic bg-gray-100 rounded-lg px-4 py-2 mt-8 mx-auto inline-block">
            No code highlights for this scene.
          </div>
        </div>
      ) : (
        <div className="overflow-auto p-4 bg-white">
          {scene.code_highlights.map((highlight, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-semibold mb-2">
                {highlight.file_path} (lines {highlight.start_line}-{highlight.end_line})
              </h3>
              <div className="rounded-lg overflow-hidden shadow-sm bg-gray-900" style={{ marginBottom: 16 }}>
                <CodeDisplay code={highlight.code} language="java" />
              </div>
              <p className="mt-4 text-gray-700 text-base">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      )}
      {/* Navigation & TOC */}
      <div className="bg-white border-t p-4 flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`px-4 py-2 rounded ${
            isFirst
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Previous
        </button>
        {/* TOC Dropdown */}
        <div className="relative" ref={tocRef}>
          <button
            type="button"
            tabIndex={0}
            onClick={() => setTocOpen(!tocOpen)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            aria-haspopup="listbox"
            aria-expanded={tocOpen}
          >
            Table of Contents
          </button>
          {tocOpen && (
            <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-72 max-h-80 overflow-auto bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-2">
              <div className="flex justify-end mb-2">
                <button
                  className="text-gray-500 hover:text-gray-800 text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                  onClick={() => setTocOpen(false)}
                >
                  Close
                </button>
              </div>
              <ul>
                {script.scenes.map((s, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-2 cursor-pointer rounded transition-colors ${idx === currentSceneIndex ? 'bg-blue-50 font-bold' : 'hover:bg-blue-100'}`}
                    onMouseDown={() => {
                      setCurrentSceneIndex(idx);
                      setTocOpen(false);
                    }}
                  >
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={isLast}
          className={`px-4 py-2 rounded ${
            isLast
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ScenePlayer; 