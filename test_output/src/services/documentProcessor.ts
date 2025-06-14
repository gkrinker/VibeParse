import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';
import mammoth from 'mammoth';

// Set the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

/**
 * Interface for a processed flashcard
 */
export interface Flashcard {
  id: number;
  headline: string;
  content: string;
  category?: string;
  sourceOffset?: number;
  deeperContent?: string;
}

/**
 * Process a PDF file and convert it to flashcards
 * @param file - The PDF file to process
 * @returns Promise<Flashcard[]> - Array of processed flashcards
 */
export async function processPDF(file: File): Promise<Flashcard[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let allText = '';

  // Extract text from all pages
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    allText += pageText + '\n\n';
  }

  return processText(allText);
}

/**
 * Process a DOCX file and convert it to flashcards
 * @param file - The DOCX file to process
 * @returns Promise<Flashcard[]> - Array of processed flashcards
 */
export async function processDOCX(file: File): Promise<Flashcard[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return processText(result.value);
}

/**
 * Process text content into flashcards
 * @param text - The text content to process
 * @returns Flashcard[] - Array of processed flashcards
 */
function processText(text: string): Flashcard[] {
  // Split text into paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Group paragraphs into chunks of approximately 120 words
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    if (currentChunk.split(/\s+/).length + words.length > 120) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // If a single paragraph is longer than 120 words, split it
      if (words.length > 120) {
        const subChunks = [];
        for (let i = 0; i < words.length; i += 120) {
          subChunks.push(words.slice(i, i + 120).join(' '));
        }
        chunks.push(...subChunks);
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + paragraph;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Convert chunks to flashcards
  return chunks.map((content, index) => {
    // Generate headline from first sentence or first 60 characters
    const firstSentence = content.split(/[.!?]/)[0].trim();
    const headline = firstSentence.length <= 60 
      ? firstSentence 
      : content.substring(0, 60).trim() + '...';

    return {
      id: index + 1,
      headline,
      content,
      sourceOffset: index,
    };
  });
}

/**
 * Process a document file (PDF or DOCX)
 * @param file - The file to process
 * @returns Promise<Flashcard[]> - Array of processed flashcards
 */
export async function processDocument(file: File): Promise<Flashcard[]> {
  if (file.type === 'application/pdf') {
    return processPDF(file);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  ) {
    return processDOCX(file);
  } else {
    throw new Error('Unsupported file type');
  }
}

/**
 * Send a PDF file to the backend for flashcard generation using the Assistants API
 * @param file - The PDF file to process
 * @returns Promise<Flashcard[]> - Array of processed flashcards
 */
export async function processPDFWithBackend(file: File): Promise<Flashcard[]> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('http://localhost:3001/api/flashcards-from-pdf', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to process PDF with backend');
  }
  const data = await response.json();
  return data.flashcards || [];
} 