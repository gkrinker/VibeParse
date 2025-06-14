import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Moon, Sun, Type, Timer } from "lucide-react";

/**
 * Props interface for the SettingsDrawer component
 */
interface SettingsDrawerProps {
  cardCount: number;           // Number of cards to display
  onCardCountChange: (value: number) => void;  // Callback for card count changes
  isDarkMode: boolean;        // Current dark mode state
  onDarkModeToggle: () => void;  // Callback for dark mode toggle
  isLargeText: boolean;       // Current text size state
  onLargeTextToggle: () => void;  // Callback for text size toggle
  autoAdvance: number;        // Auto-advance timing in seconds
  onAutoAdvanceChange: (value: number) => void;  // Callback for auto-advance changes
}

/**
 * SettingsDrawer component
 * Provides a drawer interface for adjusting application settings
 */
const SettingsDrawer = ({
  cardCount,
  onCardCountChange,
  isDarkMode,
  onDarkModeToggle,
  isLargeText,
  onLargeTextToggle,
  autoAdvance,
  onAutoAdvanceChange,
}: SettingsDrawerProps) => {
  // State for tracking drawer open/close
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggles the drawer open/close state
   */
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800" onClick={toggleDrawer}>
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle className="font-lexend">Reading Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 pt-6">
          {/* Card Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Number of Cards
              </label>
              <span className="text-sm text-gray-500">{cardCount}</span>
            </div>
            <Slider
              value={[cardCount]}
              onValueChange={([value]) => onCardCountChange(value)}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              ≈ {Math.round((cardCount * 8) / 60)} min total read time
            </p>
          </div>

          {/* Large Text Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                Large Text
              </label>
            </div>
            <Switch
              checked={isLargeText}
              onCheckedChange={onLargeTextToggle}
            />
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-gray-600" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600" />
              )}
              <label className="text-sm font-medium text-gray-700">
                Dark Mode
              </label>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onDarkModeToggle}
            />
          </div>

          {/* Auto Advance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Auto-advance
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {autoAdvance === 0 ? 'Off' : `${autoAdvance}s`}
              </span>
            </div>
            <Slider
              value={[autoAdvance]}
              onValueChange={([value]) => onAutoAdvanceChange(value)}
              min={0}
              max={30}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDrawer;
