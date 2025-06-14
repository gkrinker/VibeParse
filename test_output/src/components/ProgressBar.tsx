import { cn } from "@/lib/utils";

/**
 * Props interface for the ProgressBar component
 */
interface ProgressBarProps {
  current: number;      // Current progress value
  total: number;        // Total number of items
  answered: number;     // Number of answered items
  readingTime: number;  // Estimated reading time in minutes
}

/**
 * ProgressBar component
 * Displays progress information including completion status and reading time
 */
const ProgressBar = ({ current, total, answered, readingTime }: ProgressBarProps) => {
  // Calculate progress percentage
  const progress = (current / total) * 100;
  
  // Calculate completion percentage
  const completion = (answered / total) * 100;

  return (
    <div className="px-4 py-2">
      {/* Progress bar container */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress indicator */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        
        {/* Completion indicator */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-400 transition-all duration-300"
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Progress information */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        {/* Current progress */}
        <span>
          {current} of {total}
        </span>
        
        {/* Reading time estimate */}
        <span>
          {readingTime} min read
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
