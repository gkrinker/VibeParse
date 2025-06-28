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
    <div className="min-h-screen bg-white text-neutral-900 font-inter">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-neutral-200">
        <div className="h-1 bg-indigo-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Scene Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Scene {currentSceneIndex + 1} of {script.scenes.length}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            {scene.title}
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-4xl">
            {scene.content}
          </p>
        </div>

        {/* Code Highlights */}
        {scene.code_highlights.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center">
            <span className="text-2xl mb-4 block">📝</span>
            <p className="text-neutral-500">No code highlights for this scene.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {scene.code_highlights.map((highlight, index) => (
              <div key={index} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                {/* File Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono bg-neutral-100 px-2 py-1 rounded">
                      {highlight.file_path}
                    </span>
                    <span className="text-xs text-neutral-500">
                      lines {highlight.start_line}-{highlight.end_line}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition bg-neutral-50 hover:bg-neutral-100 px-3 py-1.5 rounded-lg">
                    <span className="text-xs">📋</span>
                    Copy
                  </button>
                </div>

                {/* Code Block */}
                <div className="rounded-xl overflow-hidden mb-4" style={{ background: '#1e1e1e' }}>
                  <CodeDisplay code={highlight.code} language="typescript" />
                </div>

                {/* Description removed as per new UX */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t border-neutral-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isFirst
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <span>←</span>
            Prev
          </button>

          {/* TOC Dropdown */}
          <div className="relative" ref={tocRef}>
            <button
              type="button"
              onClick={() => setTocOpen(!tocOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>📋</span>
              Contents
            </button>
            {tocOpen && (
              <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-80 max-h-96 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                  <h3 className="font-medium text-neutral-900">Table of Contents</h3>
                  <button
                    className="text-neutral-500 hover:text-neutral-700 text-sm px-2 py-1 rounded-lg hover:bg-neutral-100 transition"
                    onClick={() => setTocOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {script.scenes.map((s, idx) => {
                    const isChapter = s.title.startsWith('Chapter');
                    const isSkipped = s.title.startsWith('Skipped Files');
                    return (
                      <button
                        key={idx}
                        className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition border-b border-neutral-50 last:border-b-0 ${
                          idx === currentSceneIndex ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-neutral-700'
                        }`}
                        onClick={() => {
                          setCurrentSceneIndex(idx);
                          setTocOpen(false);
                        }}
                      >
                        <div className={`flex items-center gap-3 ${!isChapter && !isSkipped ? 'ml-4' : ''}`}>
                          <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full min-w-[24px] text-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm truncate">{s.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={isLast}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isLast
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700'
            }`}
          >
            Next
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenePlayer; 