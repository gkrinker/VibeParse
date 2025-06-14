import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Check, ChevronLeft, ChevronRight } from "lucide-react";
import FlashcardStack from "@/components/FlashcardStack";
import ProgressBar from "@/components/ProgressBar";
import SettingsDrawer from "@/components/SettingsDrawer";
import { Flashcard } from "@/services/documentProcessor";

/**
 * Flashcard viewer component
 * Displays and manages the flashcard learning experience
 */
const FlashcardViewer = () => {
  // Get location and navigation utilities
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get filename and flashcards from navigation state
  const { fileName = "Document", flashcards: initialFlashcards = [] } = location.state || {};
  
  // Settings state management
  const [cardCount, setCardCount] = useState(20);        // Number of cards to display
  const [isDarkMode, setIsDarkMode] = useState(false);   // Dark mode toggle
  const [isLargeText, setIsLargeText] = useState(false); // Text size toggle
  const [autoAdvance, setAutoAdvance] = useState(0);     // Auto-advance timing

  // State for managing displayed cards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  // Effect to handle card chunking based on card count setting
  useEffect(() => {
    // Use the initial flashcards or chunk them based on card count
    const chunkedCards = initialFlashcards.slice(0, Math.min(cardCount, initialFlashcards.length));
    setFlashcards(chunkedCards);
  }, [cardCount, initialFlashcards]);

  // Navigation and progress state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<number>>(new Set());
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());

  // Auto-advance effect
  useEffect(() => {
    if (autoAdvance === 0) return;
    
    const timer = setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, autoAdvance * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, autoAdvance, flashcards.length]);

  /**
   * Handles when a card is viewed
   * @param cardId - ID of the viewed card
   */
  const handleCardView = (cardId: number) => {
    setViewedCards(prev => new Set([...prev, cardId]));
  };

  /**
   * Toggles bookmark status for a card
   * @param cardId - ID of the card to bookmark/unbookmark
   */
  const handleBookmarkToggle = (cardId: number) => {
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  /**
   * Handles diving deeper into card content
   * @param cardId - ID of the card to explore
   */
  const handleDiveDeeper = (cardId: number) => {
    console.log(`Diving deeper into card ${cardId}`);
  };

  /**
   * Handles jumping to source document
   * @param cardId - ID of the card to reference
   */
  const handleJumpToSource = (cardId: number) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card?.sourceOffset !== undefined) {
      console.log(`Jumping to source offset ${card.sourceOffset} for card ${cardId}`);
    }
  };

  /**
   * Handles AI question answering
   * @param cardId - ID of the card being questioned
   * @param question - The question to ask
   */
  const handleAskAI = (cardId: number, question: string) => {
    console.log(`AI question for card ${cardId}: ${question}`);
  };

  /**
   * Resets the current learning session
   */
  const resetSession = () => {
    setCurrentIndex(0);
    setAnsweredCards(new Set());
    setViewedCards(new Set());
  };

  /**
   * Navigates to the previous card
   */
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  /**
   * Navigates to the next card
   */
  const goToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Calculate session completion status
  const isSessionComplete = viewedCards.size === flashcards.length;
  const currentCard = flashcards[currentIndex];

  // Truncate filename for mobile display
  const truncatedFileName = fileName.length > 20 ? fileName.substring(0, 20) + "..." : fileName;

  return (
    // Main container with conditional dark mode
    <div className={`min-h-screen font-lexend ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'}`}>
      {/* Header with navigation and controls */}
      <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-b shadow-sm sticky top-0 z-10`}>
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className={`${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} flex-shrink-0`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* Document title */}
          <div className="text-center flex-1 mx-4 min-w-0">
            <h1 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} truncate`}>
              {truncatedFileName}
            </h1>
          </div>
          
          {/* Settings and reset controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <SettingsDrawer
              cardCount={cardCount}
              onCardCountChange={setCardCount}
              isDarkMode={isDarkMode}
              onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
              isLargeText={isLargeText}
              onLargeTextToggle={() => setIsLargeText(!isLargeText)}
              autoAdvance={autoAdvance}
              onAutoAdvanceChange={setAutoAdvance}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSession}
              className={`${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <ProgressBar
          current={currentIndex + 1}
          total={flashcards.length}
          answered={viewedCards.size}
          readingTime={currentCard ? Math.ceil(currentCard.content.split(' ').length / 200) : 0}
        />
      </div>

      {/* Main content area */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        {!isSessionComplete ? (
          <>
            {/* Flashcard stack component */}
            <div className="relative">
              <FlashcardStack
                cards={flashcards}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                onCardView={handleCardView}
                viewedCards={viewedCards}
                bookmarkedCards={bookmarkedCards}
                onBookmarkToggle={handleBookmarkToggle}
                onDiveDeeper={handleDiveDeeper}
                onJumpToSource={handleJumpToSource}
                onAskAI={handleAskAI}
                isDarkMode={isDarkMode}
                isLargeText={isLargeText}
              />
              <div className="flex justify-between items-center mt-6 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className={`${isDarkMode ? 'bg-gray-800/80 text-gray-300 border-gray-600' : 'bg-white/80'} backdrop-blur-sm`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className={`${isDarkMode ? 'bg-gray-800/80 text-gray-300 border-gray-600' : 'bg-white/80'} backdrop-blur-sm`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Session completion view
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Session Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                You've reviewed all {flashcards.length} flashcards
              </p>
              <Button
                onClick={resetSession}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Start New Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FlashcardViewer;
