import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, BookOpen, Sparkles, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileUpload from "@/components/FileUpload";
import { processDocument, Flashcard, processPDFWithBackend } from "@/services/documentProcessor";

/**
 * Home page component of the application
 * Handles file upload and displays main features
 */
const Index = () => {
  // State for tracking the uploaded file
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // State for tracking file processing status
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for tracking processing progress
  const [processingProgress, setProcessingProgress] = useState(0);

  // State for prompt settings
  const [isPromptSettingsVisible, setIsPromptSettingsVisible] = useState(false);
  const [flashcardPrompt, setFlashcardPrompt] = useState(
    `Generate a series of flashcards based on the following text. Each flashcard should have a clear 'headline' (a question or key term) and a concise 'content' (the answer or explanation). Focus on the most important facts, definitions, and concepts. Make sure the content is succinct and easy to understand.\n\nText:\n{document_text_placeholder}`
  );
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handles file upload process
   * @param file - The file uploaded by the user
   */
  const handleFileUpload = async (file: File) => {
    try {
      console.log('Starting file upload process for:', file.name);
      setUploadedFile(file);
      setIsProcessing(true);
      setProcessingProgress(0);

      let flashcards: Flashcard[] = [];
      if (file.type === 'application/pdf') {
        // Use backend for PDF processing
        flashcards = await processPDFWithBackend(file);
      } else {
        // Use local processing for DOCX or fallback
        flashcards = await processDocument(file);
      }
      console.log('Document processed successfully. Generated flashcards:', flashcards.length);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Navigating to flashcards view...');
      navigate("/flashcards", { 
        state: { 
          fileName: file.name,
          flashcards 
        } 
      });
    } catch (error) {
      console.error('Error processing document:', error);
      // Show error message to user
      alert(`Error processing document: ${error.message}`);
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  return (
    // Main container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header section with gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        {/* Overlay for depth effect */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-12 text-center">
          {/* App icon container */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          {/* App title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            SnapRead
          </h1>
          {/* App description */}
          <p className="text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
            Transform your documents into beautiful, swipeable flashcards
          </p>
        </div>
      </div>

      {/* Main content section */}
      <div className="px-4 py-8 max-w-lg mx-auto">
        {/* Prompt Settings Button and Editor Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPromptSettingsVisible(!isPromptSettingsVisible)}
            className="flex items-center space-x-2 mb-4 bg-white/80 hover:bg-white/100 backdrop-blur-sm shadow-sm text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
          >
            <Settings className="w-4 h-4" />
            <span>{isPromptSettingsVisible ? "Hide" : "Show"} Prompt Settings</span>
          </Button>

          {isPromptSettingsVisible && (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Customize Flashcard Generation Prompt
                </h3>
                <textarea
                  value={flashcardPrompt}
                  onChange={(e) => setFlashcardPrompt(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm font-lexend bg-white"
                  placeholder="Enter your custom prompt here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your document's text will be processed using this prompt. 
                  If your prompt includes the placeholder `'{'{document_text_placeholder}'}'`, the document text will be inserted there. Otherwise, it will be appended to your prompt.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Show upload section if no file is uploaded and not processing */}
        {!uploadedFile && !isProcessing && (
          <>
            {/* File upload card */}
            <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {/* Upload icon */}
                  <div className="inline-flex p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  {/* Upload section title */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Upload Your Document
                  </h2>
                  {/* Supported file types */}
                  <p className="text-gray-600 text-sm">
                    Support for PDF and Word documents
                  </p>
                </div>
                
                {/* File upload component */}
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>

            {/* Features section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Why SnapRead?
              </h3>
              
              {/* Feature cards grid */}
              <div className="grid gap-4">
                {/* Smart Extraction feature card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Smart Extraction</h4>
                      <p className="text-sm text-purple-100">
                        AI-powered content parsing
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Optimized feature card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mobile Optimized</h4>
                      <p className="text-sm text-blue-100">
                        Swipe-friendly interface
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Beautiful Design feature card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Beautiful Design</h4>
                      <p className="text-sm text-indigo-100">
                        Gorgeous, distraction-free cards
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Processing state UI */}
        {isProcessing && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              {/* Loading spinner */}
              <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              {/* Processing message */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Creating Your Flashcards
              </h3>
              <p className="text-gray-600">
                Processing {uploadedFile?.name}...
              </p>
              {/* Progress bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
