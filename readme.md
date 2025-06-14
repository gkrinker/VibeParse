# 🧠 Code Explainer Video App – AI-Powered Architecture 

> 📚 Related Documents:
> - [Product Requirements Document (PRD)](prd.md)
> - [Development Plan](development-plan.md)

Build an app that takes a link to a public GitHub file or directory and creates a video that explains the code in simple terms. Users can select their coding proficiency and desired depth (line-by-line, chunk-by-chunk, or key insights).

---

## 🔧 Core Architecture Overview

### 1. User Input

- **Inputs:**
  - GitHub URL (to a file or directory)
  - Proficiency level: `Beginner`, `Intermediate`, `Expert`
  - Time commitment: `Line-by-line`, `Chunk-by-chunk`, `Key parts only`
  - File types to include (for directories): `Python`, `JavaScript`, `TypeScript`, etc.
- **Optional Settings:**
  - Preferred language (for narration)
  - Output format: `Narrated video`, `Text summary`, `Code overlay`
  - Maximum number of files to process (for directories)

---

### 2. Code Retrieval & Parsing

- Use GitHub's REST API or fetch raw content:
  - **Single File**: Fetch and parse.
  - **Directory**: 
    - Recursively retrieve all code files
    - Filter by file type
    - Maintain file hierarchy
    - Detect file dependencies
- Parse code with:
  - [`tree-sitter`](https://tree-sitter.github.io/tree-sitter/) (multi-language)
  - Language-specific parsers (`ast` for Python, `esprima` for JS)
  - Cross-file dependency analysis

---

### 3. Summarization + Explanation Engine (LLM-Powered)

- Use OpenAI GPT-4 or Anthropic Claude:
  - Analyze the code structure
  - Generate plain-English explanations
  - Identify relationships between files
  - Tailor content to:
    - User proficiency
    - Time depth
    - Project complexity

#### Prompt Example:

```
Here is a Python project with multiple files. The user is a beginner and wants a high-level overview only.
Please identify:
1. The main entry points
2. Key functions and their relationships
3. How files interact with each other
4. Important logic decisions
Use metaphors or analogies where helpful.

[Insert code files here]
```

---

### 4. Narration Script Builder

- Organize LLM output into a video script:
  - Divide into **scenes**: per function, class, or file
  - Add transitions between sections and files
  - Highlight referenced lines/blocks for later use
  - Include file context switches
  - Maintain narrative flow across multiple files

---

### 5. Video Generator

#### Option A: Text-to-Video APIs

- Use:
  - [Pika Labs](https://www.pika.art/)
  - [Runway](https://runwayml.com/)
  - [Synthesia](https://www.synthesia.io/)

#### Option B: TTS + Code Animation

- TTS with:
  - [ElevenLabs](https://www.elevenlabs.io/)
  - Google Cloud TTS
- Combine narration + code using:
  - Code screenshots or overlays
  - ffmpeg or simple motion libraries (e.g., [remotion.dev](https://www.remotion.dev/))

---

### 6. Frontend (Web UI)

- Stack: `React + Tailwind CSS`
- Features:
  - URL input
  - Proficiency & time sliders
  - Video preview/download
  - Optional: side-by-side code & video playback

---

### 7. Backend / Orchestration

- Stack: `Python (FastAPI)` or `Node.js (Express)`
- Components:
  - GitHub API integration
  - LLM inference engine (OpenAI/Anthropic)
  - TTS & video rendering pipeline
- Queueing & Storage:
  - Celery + Redis or Firebase Functions
  - S3 or Supabase for storing generated videos

---

## 🧠 Optional Enhancements

- **AI Chat**: Ask follow-up questions about the code
- **Interactive Pauses**: Pause video and explore code snippets
- **Multilingual Narration**: Translate explanations and voiceovers
- **Browser Extension**: Trigger explainer generation from GitHub pages

---

## 🧪 MVP in a Day (Simplified Flow)

1. User inputs GitHub file URL + preferences
2. Backend fetches code
3. OpenAI generates a narrated explanation
4. ElevenLabs creates voiceover
5. `ffmpeg` renders a simple video
6. Output delivered via a shareable or downloadable link

---

