import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Quote, MessageCircle, Bookmark, BookOpen } from "lucide-react";
import { useState } from "react";

interface CardActionsProps {
  cardId: number;
  isBookmarked: boolean;
  onBookmarkToggle: (cardId: number) => void;
  onDiveDeeper: (cardId: number) => void;
  onJumpToSource: (cardId: number) => void;
  onAskAI: (cardId: number, question: string) => void;
  deeperContent?: string;
}

const CardActions = ({
  cardId,
  isBookmarked,
  onBookmarkToggle,
  onDiveDeeper,
  onJumpToSource,
  onAskAI,
  deeperContent
}: CardActionsProps) => {
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [isDeeperOpen, setIsDeeperOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAskingAI(true);
    try {
      // Simulate AI response for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiResponse(`Based on the content, ${aiQuestion.toLowerCase()}... This is a simulated AI response that would provide contextual information about the current card content.`);
      onAskAI(cardId, aiQuestion);
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Dive Deeper */}
      <Sheet open={isDeeperOpen} onOpenChange={setIsDeeperOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDiveDeeper(cardId)}
            className="text-gray-400 hover:text-blue-600 flex flex-col items-center gap-1 h-auto py-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Deeper</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle className="font-lexend">Dive Deeper</SheetTitle>
          </SheetHeader>
          <div className="pt-4 overflow-y-auto">
            <div className="prose prose-sm max-w-none font-lexend leading-reading">
              {deeperContent || "Additional context and surrounding paragraphs would appear here, giving you more detail about this section of the document."}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Jump to Source */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onJumpToSource(cardId)}
        className="text-gray-400 hover:text-green-600 flex flex-col items-center gap-1 h-auto py-2"
      >
        <Quote className="w-4 h-4" />
        <span className="text-xs">Source</span>
      </Button>

      {/* Ask AI */}
      <Sheet open={isAIOpen} onOpenChange={setIsAIOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-purple-600 flex flex-col items-center gap-1 h-auto py-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Ask AI</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle className="font-lexend">Ask AI</SheetTitle>
          </SheetHeader>
          <div className="pt-4 space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask a question about this content..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-lexend"
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
              />
              <Button
                onClick={handleAskAI}
                disabled={isAskingAI || !aiQuestion.trim()}
                size="sm"
              >
                {isAskingAI ? "..." : "Ask"}
              </Button>
            </div>
            {aiResponse && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-lexend leading-reading text-gray-700">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CardActions;
