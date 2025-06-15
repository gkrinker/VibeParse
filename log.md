# 📝 VibeParse Project Log

### June 2024: Product Pivot to Code + Explanations (No Video)
- Pivoted product direction: now outputs code snippets and bite-sized explanations for a frontend, not video content.
- Updated `prd.md`, `development-plan.md`, and `readme.md` to reflect the new focus on code + explanations and removed video/TTS-specific sections.
- Strengthened LLM prompt to require every code entity mention to be wrapped in Markdown backticks and clarified explanation requirements for clarity and consistency. **(Later reverted: explicit code entity formatting instruction was removed, now using default LLM behavior.)**

### June 2024: Video generation working but sometimes rendered code is too small
- [2024-06-XX] Video generation pipeline is functional and produces scene-based videos from Markdown scripts.
- However, rendered code is sometimes too small for optimal viewing; further improvements to dynamic font sizing or layout may be needed.

### June 2024 (Video Generation): CodeHighlight Attribute Update
- [2024-06-XX] Updated video generation to use correct CodeHighlight attributes:
  - Changed from `explanation` to `description` to match the model
  - Updated all variable names and file paths to reflect this change
  - Ensures proper handling of code highlight descriptions

### June 2024 (Video Generation): MoviePy 2.2.1 Audio Method Update
- [2024-06-XX] Updated MoviePy audio handling to match 2.2.1 API:
  - Changed from `set_audio()` to `with_audio()` method
  - Updated all clip audio assignments to use the new method
  - Ensures proper audio synchronization in multi-segment videos

### June 2024 (Video Generation): MoviePy 2.2.1 Resize Effect Update
- [2024-06-XX] Updated MoviePy resize functionality to match 2.2.1 API:
  - Changed from direct `resize()` method to using `Resize` effect class
  - Using `with_effects([Resize(new_size=size)])` for resizing clips
  - Ensures proper video dimensions for TikTok/Reels format (1080x1920)

### June 2024 (Video Generation): MoviePy 2.2.1 Duration Method Update
- [2024-06-XX] Updated MoviePy duration setting to match 2.2.1 API:
  - Changed from `set_duration()` to `with_duration()` method
  - Updated all clip duration settings to use the new method
  - Ensures proper timing for multi-segment videos

### June 2024 (Video Generation): MoviePy 2.2.1 Import Updates
- [2024-06-XX] Updated MoviePy imports to match 2.2.1 API:
  - Changed from `moviepy.editor` to direct imports from `moviepy`
  - Updated imports for `AudioFileClip`, `ImageClip`, `CompositeVideoClip`, and `concatenate_videoclips`
  - Ensures compatibility with latest MoviePy version

### June 2024 (Video Generation): Multi-Segment Video Generation
- [2024-06-XX] Enhanced video generation to support full scene content:
  - Now generates separate video segments for scene introduction and each code highlight
  - Each segment includes both explanation and code with synchronized audio
  - Uses temporary directory for intermediate files during generation
  - Concatenates all segments into a single video while maintaining proper timing
  - Maintains TikTok/Reels format (1080x1920) throughout

### June 2024 (Video Generation): MoviePy 2.2.1 API Update
- [2024-06-XX] Updated video composer to use MoviePy 2.2.1 API:
  - Using `Resize` class from `moviepy.video.fx.Resize` module
  - Using `clip.with_effects([Resize(new_size=size)])` for resizing
  - Maintains compatibility with TikTok/Reels format (1080x1920)

### June 2024 (Batching Milestone): Multi-File Script Generation with Batching
- [2024-06-XX] Added support for generating scripts from multiple files in a codebase using per-file batching to stay within LLM token limits.
- Each file is token-estimated and grouped into batches; batches are processed sequentially and results are aggregated into a single Markdown script.
- Large files that exceed the token threshold are skipped gracefully and listed in the output.
- Added real-time logging for GitHub fetching, batching, and script generation progress.
- Successfully tested on the full snap-read codebase: multi-file, multi-batch script generation now works end-to-end.

### June 2024: Scene-Based Script Generation with Code Blocks
- Updated LLM prompt to require actual code snippets (as fenced code blocks) for every code highlight in each scene, unless the scene is only context/transition.
- Enhanced the response parser to extract code blocks from the LLM output, and if missing, fetch the code directly from the file using line numbers.
- Updated the `CodeHighlight` model to include a `code` field and improved Markdown rendering to always show code blocks after each explanation.
- The generated Markdown scripts are now suitable for both human review and downstream video generation.
- Successfully tested end-to-end: can now generate scene-based explanations with code for a single file (e.g., `App.tsx` from snap-read).

### June 2024: Web-Based Scene Player Implementation
- [2024-06-XX] Implemented new web-based scene player approach:
  - Created React frontend with TypeScript and Tailwind CSS
  - Implemented ScenePlayer component with navigation
  - Added CodeDisplay with syntax highlighting
  - Added AudioPlayer with basic controls
  - Set up project structure and dependencies
  - Ready for integration with backend API

### June 2024: Fix Redundant Scene Title Prefix
- Updated `src/services/script_generator.py` to only prepend `Scene X:` to scene titles if not already present.
- Prevents double prefixes like `Scene 2: Scene 2: Anchoring the App` in generated markdown and UI.

## Phase 2: Code Analysis & Script Generation (June 2024)

### 1. LLM Service & OpenAI Integration
- Added `src/services/llm_service.py` for GPT-4o integration using environment variable loading (`OPENAI_API_KEY` via `.env`)
- Implemented prompt structure and response parsing for code explanation scripts

### 2. Script Generation Service & Models
- Added `src/services/script_generator.py` to coordinate GitHub code fetching and LLM script generation
- Added `src/models/script.py` with `Script`, `Scene`, and `CodeHighlight` models

### 3. API Endpoints
- Added `/api/generate-script` endpoint for generating explanation scripts from GitHub URLs
- Added `/api/test-llm` endpoint for simple OpenAI connectivity testing

### 4. Environment & Security
- Added `.env` loading with `python-dotenv`
- Updated `.gitignore` to exclude `.env` files

### 5. Testing & Verification
- Successfully tested `/api/test-llm` endpoint with curl, confirming OpenAI connectivity and response
- Ready to proceed with full script generation flow

## Summary of Progress (as of June 2024)

### 1. Project Initialization
- Created a new repository: [VibeParse](https://github.com/gkrinker/VibeParse)
- Added key planning documents:
  - [Product Requirements Document (prd.md)](prd.md)
  - [Development Plan (development-plan.md)](development-plan.md)
  - Updated [README](readme.md) to link to these documents

### 2. Backend Setup (Phase 1)
- Set up a Python FastAPI backend with the following structure:
  - `src/api/app.py`: Main FastAPI app
  - `src/api/routes/code.py`: API endpoint for code fetching
  - `src/services/github_service.py`: Service for interacting with the GitHub API
  - `requirements.txt`: Project dependencies
  - `.gitignore`: Now excludes `.env` and other sensitive files
- Added a `.env` file (not tracked in git) for storing the GitHub Personal Access Token

### 3. GitHub Code Fetching
- Implemented `/api/fetch-code` endpoint:
  - Supports both single file (`/blob/branch/path`) and directory (`/tree/branch/path`) GitHub URLs
  - Handles branch names correctly when fetching content
  - Allows filtering by file type for directories
  - Added an optional `save_to_disk` flag to save fetched files locally in a `test_output/` directory, preserving structure
- Example usage:
  ```bash
  curl -X POST http://localhost:8080/api/fetch-code \
    -H "Content-Type: application/json" \
    -d '{
      "github_url": "https://github.com/gkrinker/snap-read/tree/main/src",
      "file_types": ["ts", "tsx", "js"],
      "save_to_disk": true
    }'
  ```

### 4. Security & Git Hygiene
- Accidentally committed `.env` (with secret) to git; push was blocked by GitHub
- Removed `.env` from git tracking and history using `git filter-repo --force`
- Force-pushed cleaned history to GitHub
- Confirmed repository is now safe and up to date

### 5. Next Steps
- Phase 1 (code retrieval) is complete and tested
- Ready to proceed to Phase 2: Code Analysis & Script Generation

# Development Log

## Dependency Management and Security Updates (2024-03-21)

### Cleanup and Optimization
- Removed unused Redux dependencies:
  - Removed @reduxjs/toolkit
  - Removed react-redux
- Kept @types/react-syntax-highlighter for TypeScript support
- All other core dependencies remain unchanged as they are actively used in the codebase

### Security Updates
- Updated react-syntax-highlighter to v15.6.1 to address highlight.js vulnerabilities
- Updated postcss to v8.4.31 to address security issues
- Verified all TypeScript type definitions are up to date

### Dependency Verification
- Performed clean reinstall of all dependencies
- Verified package compatibility
- Addressed security vulnerabilities in direct dependencies
- Note: Some remaining warnings are from transitive dependencies (dependencies of dependencies) and don't affect security

### Current Status
- All critical security vulnerabilities have been addressed
- Application dependencies are now optimized and secure
- Development environment is properly configured with correct versions

---

**This log is intended for all agents and contributors to quickly understand the current state and history of the VibeParse project.**

---
2024-06-15: Added runtime.txt to pin Python version to 3.11.9 for Render.com deployment. This avoids build errors related to Rust and ensures pre-built wheels are used for dependencies like pydantic-core and aiohttp. 