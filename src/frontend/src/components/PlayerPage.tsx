import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ScenePlayer from './ScenePlayer';
import { Script } from '../types/script';

// Utility to get API base URL
const getApiUrl = (path: string) => {
  const base = process.env.REACT_APP_API_URL || '';
  return `${base}${path}`;
};

const PlayerPage: React.FC = () => {
  const { scriptID } = useParams<{ scriptID: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/scripts/${scriptID}`));
        if (!response.ok) throw new Error('Failed to load script');
        const data = await response.json();
        setScript(data);
      } catch (err) {
        setError('Failed to load script');
      } finally {
        setLoading(false);
      }
    };
    fetchScript();
  }, [scriptID]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">No script available</div>
      </div>
    );
  }

  const currentScene = script.scenes[currentSceneIndex];
  console.log('PlayerPage: currentScene', currentScene);
  console.log('PlayerPage: code_highlights', currentScene.code_highlights);

  const handleNext = () => {
    if (currentSceneIndex < script.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  return (
    <ScenePlayer
      scene={currentScene}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isFirst={currentSceneIndex === 0}
      isLast={currentSceneIndex === script.scenes.length - 1}
    />
  );
};

export default PlayerPage; 