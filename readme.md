# 🧠 Code Explainer App – AI-Powered Architecture 

> 📚 Related Documents:
> - [Product Requirements Document (PRD)](prd.md)
> - [Development Plan](development-plan.md)

Build an app that takes a link to a public GitHub file or directory and creates a set of bite-sized explanations for the code in simple terms. Users can select their coding proficiency and desired depth (line-by-line, chunk-by-chunk, or key insights).

---

## 🔧 Core Architecture Overview

### 1. User Input

- **Inputs:**
  - GitHub URL (to a file or directory)
  - Proficiency level: `Beginner`, `Intermediate`, `Expert`
  - Time commitment: `Line-by-line`, `Chunk-by-chunk`, `Key parts only`
  - File types to include (for directories): `Python`, `JavaScript`, `TypeScript`, etc.
- **Optional Settings:**
  - Preferred language (for explanations)
  - Output format: `Text summary`, `Code overlay`
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
  - Generate plain-English, bite-sized explanations
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

### 4. Explanation Script Builder

- Organize LLM output into a set of bite-sized explanations:
  - Divide into **sections**: per function, class, or file
  - Add transitions between sections and files
  - Highlight referenced lines/blocks for later use
  - Include file context switches
  - Maintain narrative flow across multiple files

---

### 5. Frontend (Web UI)

- Stack: `React + Tailwind CSS`
- Features:
  - URL input
  - Proficiency & time sliders
  - Explanation preview/download
  - Optional: side-by-side code & explanation playback

---

### 6. Backend / Orchestration

- Stack: `Python (FastAPI)` or `Node.js (Express)`
- Components:
  - GitHub API integration
  - LLM inference engine (OpenAI/Anthropic)
- Queueing & Storage:
  - Celery + Redis or Firebase Functions
  - S3 or Supabase for storing generated explanations (if needed)

---

## 🧠 Optional Enhancements

- **AI Chat**: Ask follow-up questions about the code
- **Interactive Pauses**: Pause and explore code snippets
- **Multilingual Explanations**: Translate explanations
- **Browser Extension**: Trigger explainer generation from GitHub pages

---

## 🧪 MVP in a Day (Simplified Flow)

1. User inputs GitHub file URL + preferences
2. Backend fetches code
3. OpenAI generates a set of bite-sized explanations
4. Output delivered via a shareable or downloadable link

---

