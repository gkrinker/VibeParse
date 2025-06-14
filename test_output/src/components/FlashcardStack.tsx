import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CardActions from "@/components/CardActions";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, ExternalLink, MessageSquare } from "lucide-react";

/**
 * Interface defining the structure of a flashcard
 */
interface Flashcard {
  id: number;              // Unique identifier for the card
  headline: string;        // Main title of the card
  content: string;         // Main content of the card
  category?: string;       // Optional category for organization
  sourceOffset?: number;   // Optional reference to source document
  deeperContent?: string;  // Optional additional content for deeper learning
}

/**
 * Props interface for the FlashcardStack component
 */
interface FlashcardStackProps {
  cards: Flashcard[];                    // Array of flashcards to display
  currentIndex: number;                  // Index of the current card
  setCurrentIndex: (index: number) => void;  // Function to update current index
  onCardView: (cardId: number) => void;  // Callback when a card is viewed
  viewedCards: Set<number>;              // Set of viewed card IDs
  bookmarkedCards: Set<number>;          // Set of bookmarked card IDs
  onBookmarkToggle: (cardId: number) => void;  // Callback for bookmark toggle
  onDiveDeeper: (cardId: number) => void;      // Callback for diving deeper
  onJumpToSource: (cardId: number) => void;    // Callback for jumping to source
  onAskAI: (cardId: number, question: string) => void;  // Callback for AI questions
  isDarkMode: boolean;                   // Dark mode state
  isLargeText: boolean;                  // Text size state
}

const FlashcardStack = ({ 
  cards, 
  currentIndex,
  setCurrentIndex,
  onCardView, 
  viewedCards, 
  bookmarkedCards,
  onBookmarkToggle,
  onDiveDeeper,
  onJumpToSource,
  onAskAI,
  isDarkMode,
  isLargeText
}: FlashcardStackProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, rotation: 0, scale: 1 });
  const [nextCardPosition, setNextCardPosition] = useState({ x: window.innerWidth, y: 0, rotation: 0, scale: 1 });
  const [prevCardPosition, setPrevCardPosition] = useState({ x: -window.innerWidth, y: 0, rotation: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedContent, setExpandedContent] = useState<Set<number>>(new Set());
  const [aiQuestion, setAiQuestion] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const currentCardElementRef = useRef<HTMLDivElement>(null);
  const [transitionSpeed, setTransitionSpeed] = useState('0.3s');

  const currentCard = cards[currentIndex];
  const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;
  const prevCard = currentIndex > 0 ? cards[currentIndex - 1] : null;
  const isViewed = viewedCards.has(currentCard?.id);
  const isBookmarked = bookmarkedCards.has(currentCard?.id);

  // Mark card as viewed when it becomes visible
  useEffect(() => {
    if (currentCard && !isViewed) {
      onCardView(currentCard.id);
    }
  }, [currentCard, isViewed, onCardView]);

  // Effect to restore transition speed after animation/snapping
  useEffect(() => {
    if (!isAnimating) {
      // Set a micro-delay to ensure state changes from setTimeout have propagated
      const timer = setTimeout(() => setTransitionSpeed('0.3s'), 0);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Effect to synchronize swipe container height with the current card's height
  useEffect(() => {
    if (currentCardElementRef.current && cardRef.current) {
      const currentCardHeight = currentCardElementRef.current.offsetHeight;
      if (currentCardHeight > 0) {
        cardRef.current.style.height = `${currentCardHeight}px`;
      }
    }
  }, [currentIndex, cards, isLargeText, currentCard, transitionSpeed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = currentX - touchStart.x;
    const deltaY = currentY - touchStart.y;
    
    // Calculate rotation and scale based on horizontal movement
    const rotation = deltaX * 0.1;
    const scale = 1 - Math.abs(deltaX) * 0.001; // Scale down as card moves
    
    // Update current card position
    setCardPosition({
      x: deltaX,
      y: deltaY * 0.3,
      rotation,
      scale: Math.max(0.8, scale)
    });
    
    // Update next/previous card positions based on drag direction
    if (deltaX < 0 && nextCard) {
      // Dragging left, bring in next card
      setNextCardPosition({
        x: window.innerWidth + deltaX,
        y: 0,
        rotation: 0,
        scale: 1
      });
      setPrevCardPosition({
        x: -window.innerWidth,
        y: 0,
        rotation: 0,
        scale: 1
      });
    } else if (deltaX > 0 && prevCard) {
      // Dragging right, bring in previous card
      setPrevCardPosition({
        x: -window.innerWidth + deltaX,
        y: 0,
        rotation: 0,
        scale: 1
      });
      setNextCardPosition({
        x: window.innerWidth,
        y: 0,
        rotation: 0,
        scale: 1
      });
    }
    
    setTouchEnd({
      x: currentX,
      y: currentY,
      time: Date.now()
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Determine if swipe should trigger card change
    const shouldChangeCard = Math.abs(deltaX) > 100 || velocity > 0.5;
    const isLeftSwipe = deltaX > 0;

    setIsDragging(false);

    if (shouldChangeCard && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsAnimating(true);
      
      // Animate current card out with "sucking" effect
      setCardPosition({
        x: isLeftSwipe ? window.innerWidth * 1.5 : -window.innerWidth * 1.5,
        y: deltaY * 0.3,
        rotation: isLeftSwipe ? 45 : -45,
        scale: 0.5
      });
      
      // Animate next/previous card to center
      if (isLeftSwipe && prevCard) {
        setPrevCardPosition({ x: 0, y: 0, rotation: 0, scale: 1 });
      } else if (!isLeftSwipe && nextCard) {
        setNextCardPosition({ x: 0, y: 0, rotation: 0, scale: 1 });
      }
      
      // Update index and positions after animation
      setTimeout(() => {
        setTransitionSpeed('0s');

        let updated = false;
        if (isLeftSwipe && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          updated = true;
        } else if (!isLeftSwipe && currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          updated = true;
        }

        // Reset all positions to their stable states (will snap due to transitionSpeed = '0s')
        setCardPosition({ x: 0, y: 0, rotation: 0, scale: 1 });
        setNextCardPosition({ x: window.innerWidth, y: 0, rotation: 0, scale: 1 });
        setPrevCardPosition({ x: -window.innerWidth, y: 0, rotation: 0, scale: 1 });
        
        setIsAnimating(false);
        
      }, 300);
    } else {
      // Not a swipe, or invalid swipe: Reset positions with animation (isDragging is false, transitionSpeed is '0.3s')
      setCardPosition({ x: 0, y: 0, rotation: 0, scale: 1 });
      setNextCardPosition({ x: window.innerWidth, y: 0, rotation: 0, scale: 1 });
      setPrevCardPosition({ x: -window.innerWidth, y: 0, rotation: 0, scale: 1 });
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  /**
   * Toggles the expanded state of a card's content
   * @param cardId - ID of the card to toggle
   */
  const toggleExpand = (cardId: number) => {
    setExpandedContent(prev => {
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
   * Handles AI question submission
   * @param cardId - ID of the card being questioned
   */
  const handleAskAI = (cardId: number) => {
    if (aiQuestion.trim()) {
      onAskAI(cardId, aiQuestion);
      setAiQuestion("");
    }
  };

  if (!currentCard) return null;

  const textSizeClass = isLargeText ? 'text-lg' : 'text-base';
  const headlineSizeClass = isLargeText ? 'text-xl' : 'text-lg';

  return (
    <div className="relative overflow-hidden">
      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Card */}
        {prevCard && (
          <Card 
            className={cn(
              "w-full border-0 shadow-2xl transition-all duration-200 absolute top-0 left-0",
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" 
                : "bg-gradient-to-br from-white to-blue-50"
            )}
            style={{
              transform: `translate(${prevCardPosition.x}px, ${prevCardPosition.y}px) rotate(${prevCardPosition.rotation}deg) scale(${prevCardPosition.scale})`,
              transition: isDragging ? 'none' : `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: 5,
              width: '100%'
            }}
          >
            <CardContent className="p-6 flex flex-col">
              <div className="flex justify-end items-start mb-4">
                <div className={cn(
                  "text-xs opacity-60",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Swipe to navigate
                </div>
              </div>
              
              <h2 className={cn(
                "font-semibold mb-4 leading-tight",
                headlineSizeClass,
                isDarkMode ? "text-gray-100" : "text-gray-800"
              )}>
                {prevCard.headline}
              </h2>

              <div className="flex-1 mb-4">
                <p className={cn(
                  "leading-relaxed",
                  textSizeClass,
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>
                  {prevCard.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Card */}
        <Card 
          ref={currentCardElementRef}
          className={cn(
            "w-full border-0 shadow-2xl transition-all duration-200 absolute top-0 left-0",
            isDarkMode 
              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" 
              : "bg-gradient-to-br from-white to-blue-50",
            isViewed && "opacity-95"
          )}
          style={{
            transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) rotate(${cardPosition.rotation}deg) scale(${cardPosition.scale})`,
            transition: isDragging ? 'none' : `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 10,
            width: '100%'
          }}
        >
          <CardContent className="p-6 flex flex-col">
            <div className="flex justify-end items-start mb-4">
              <div className={cn(
                "text-xs opacity-60",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Swipe to navigate
              </div>
            </div>
            
            {/* Headline */}
            <h2 className={cn(
              "font-semibold mb-4 leading-tight",
              headlineSizeClass,
              isDarkMode ? "text-gray-100" : "text-gray-800"
            )}>
              {currentCard.headline}
            </h2>
            
            {/* Content - fixed height with no scroll */}
            <div className="flex-1 mb-4">
              <p className={cn(
                "leading-relaxed",
                textSizeClass,
                isDarkMode ? "text-gray-200" : "text-gray-700"
              )}>
                {currentCard.content}
              </p>
            </div>
            
            {/* Card Actions */}
            <div className="relative z-20">
              <CardActions
                cardId={currentCard.id}
                isBookmarked={isBookmarked}
                onBookmarkToggle={onBookmarkToggle}
                onDiveDeeper={onDiveDeeper}
                onJumpToSource={onJumpToSource}
                onAskAI={onAskAI}
                deeperContent={currentCard.deeperContent}
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Card */}
        {nextCard && (
          <Card 
            className={cn(
              "w-full border-0 shadow-2xl transition-all duration-200 absolute top-0 left-0",
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" 
                : "bg-gradient-to-br from-white to-blue-50"
            )}
            style={{
              transform: `translate(${nextCardPosition.x}px, ${nextCardPosition.y}px) rotate(${nextCardPosition.rotation}deg) scale(${nextCardPosition.scale})`,
              transition: isDragging ? 'none' : `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: 5,
              width: '100%'
            }}
          >
            <CardContent className="p-6 flex flex-col">
              <div className="flex justify-end items-start mb-4">
                <div className={cn(
                  "text-xs opacity-60",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Swipe to navigate
                </div>
              </div>
              
              <h2 className={cn(
                "font-semibold mb-4 leading-tight",
                headlineSizeClass,
                isDarkMode ? "text-gray-100" : "text-gray-800"
              )}>
                {nextCard.headline}
              </h2>

              <div className="flex-1 mb-4">
                <p className={cn(
                  "leading-relaxed",
                  textSizeClass,
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>
                  {nextCard.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FlashcardStack;
