import { describe, it, expect } from 'vitest';
import { processDocument } from './documentProcessor';

// Minimal PDF ("Hello World") as base64
const minimalPdfBase64 =
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDQgMCBSL0dyb3VwPDwvUy9UcmFuc3BhcmVuY3kvQ1MvRGV2aWNlUkdCPj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMzQ+PnN0cmVhbQpCBiAgICBUIEhlbGxvIFdvcmxkIQplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxMTAgMDAwMDAgbiAKMDAwMDAwMDE2MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA1Pj4Kc3RhcnR4cmVmCjE3OQolJUVPRgo=';

// Minimal DOCX ("Hello World") as base64
const minimalDocxBase64 =
  'UEsDBBQABgAIAAAAIQAAAAAAAAAAAAAAAAAJAAAAd29yZC9VVAkAAxwQb2McEG9jdXgLAAEE6AMAAAToAwAAUEsDBBQABgAIAAAAIQAAAAAAAAAAAAAAAAATAAAAd29yZC9kb2N1bWVudC54bWxVVAkAAxwQb2McEG9jdXgLAAEE6AMAAAToAwAAeJxjYGBgYGBgZmBgZGBg4GIAAQxgA2I0AABQSwUGAAAAAAIAAgCwAAAA1AAAAAAA';

function base64ToFile(base64: string, filename: string, type: string): File {
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type });
}

describe('processDocument', () => {
  // it('should process a minimal PDF file and return at least one flashcard', async () => {
  //   const file = base64ToFile(minimalPdfBase64, 'test.pdf', 'application/pdf');
  //   const flashcards = await processDocument(file);
  //   expect(Array.isArray(flashcards)).toBe(true);
  //   expect(flashcards.length).toBeGreaterThan(0);
  //   expect(flashcards[0].content).toMatch(/Hello World/i);
  // });

  // it('should process a minimal DOCX file and return at least one flashcard', async () => {
  //   const file = base64ToFile(minimalDocxBase64, 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  //   const flashcards = await processDocument(file);
  //   expect(Array.isArray(flashcards)).toBe(true);
  //   expect(flashcards.length).toBeGreaterThan(0);
  //   expect(flashcards[0].content).toMatch(/Hello World/i);
  // });
}); 