import React from 'react';
import { Scene } from '../types/script';
import CodeDisplay from './CodeDisplay';

interface ScenePlayerProps {
  scene: Scene;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ScenePlayer: React.FC<ScenePlayerProps> = ({
  scene,
  onNext,
  onPrevious,
  isFirst,
  isLast
}) => {
  console.log('ScenePlayer: scene', scene);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">{scene.title}</h1>
        <p className="text-gray-600 mt-2">{scene.content}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {scene.code_highlights.length === 0 ? (
          <div className="text-gray-500 italic">No code highlights for this scene.</div>
        ) : (
          scene.code_highlights.map((highlight, index) => {
            console.log('ScenePlayer: highlight', highlight);
            const codeToShow = typeof highlight.code === 'string' ? highlight.code : JSON.stringify(highlight.code);
            console.log('ScenePlayer: codeToShow', codeToShow);
            return (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-2">
                  {highlight.file_path} (lines {highlight.start_line}-{highlight.end_line})
                </h3>
                <CodeDisplay code={codeToShow} language="java" />
                <p className="mt-2 text-gray-700">{highlight.description}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation */}
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
        <div className="text-gray-600">
          {/* Optionally show scene number here */}
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