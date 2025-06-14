# 🚀 VibeParse Development Plan

## 📋 Overview

This document outlines the development milestones for building VibeParse, an AI-powered code explanation video generator. The plan is divided into two main phases:
1. Backend MVP (4-hour implementation)
2. Frontend MVP (Post-backend completion)

## 🎯 Backend MVP Milestones (4 Hours)

### Phase 1: Code Retrieval (1 hour)
**Goal**: Create a service that can fetch and parse code from GitHub URLs, supporting both single files and directories

**Deliverables**:
- [ ] GitHub API integration service
- [ ] File content retrieval endpoint
- [ ] Directory traversal and file aggregation
- [ ] Basic error handling for invalid URLs
- [ ] Simple response format for code content
- [ ] File type filtering (code files only)

**Testing Criteria**:
- Can successfully fetch code from public GitHub files
- Can successfully fetch and aggregate code from public GitHub directories
- Returns appropriate error messages for invalid URLs
- Response time < 2 seconds for single file retrieval
- Response time < 5 seconds for directory retrieval (up to 10 files)
- Properly filters out non-code files

**Example Usage**:
```bash
# Single file
curl -X POST http://localhost:8000/api/fetch-code \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/user/repo/blob/main/file.py"}'

# Directory
curl -X POST http://localhost:8000/api/fetch-code \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/user/repo/tree/main/src",
    "file_types": ["py", "js", "ts", "java"]
  }'
```

### Phase 2: Code Analysis & Script Generation (1.5 hours)
**Goal**: Generate explanation scripts using LLM

**Deliverables**:
- [ ] OpenAI/Claude integration
- [ ] Basic prompt template system
- [ ] Script generation endpoint
- [ ] Structured response format for explanations
- [ ] Multi-file analysis and relationship mapping
- [ ] File dependency detection

**Testing Criteria**:
- Generates coherent explanations for simple code files
- Generates coherent explanations for multiple related files
- Handles different code languages
- Response time < 10 seconds for single file analysis
- Response time < 30 seconds for directory analysis (up to 10 files)

**Example Usage**:
```bash
curl -X POST http://localhost:8000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"path": "src/main.py", "content": "..."},
      {"path": "src/utils.py", "content": "..."}
    ],
    "proficiency": "beginner",
    "depth": "key-parts"
  }'
```

### Phase 3: Video Generation (1.5 hours)
**Goal**: Convert scripts into video content

**Deliverables**:
- [ ] Text-to-speech integration (ElevenLabs)
- [ ] Basic video generation pipeline
- [ ] Video storage and retrieval system
- [ ] Status tracking for video generation
- [ ] Multi-file visualization support
- [ ] File transition effects

**Testing Criteria**:
- Successfully generates videos from scripts
- Handles video generation asynchronously
- Provides status updates for generation progress
- Smooth transitions between multiple files
- Clear file context indicators

**Example Usage**:
```bash
curl -X POST http://localhost:8000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "script": "...",
    "files": [
      {"path": "src/main.py", "content": "..."},
      {"path": "src/utils.py", "content": "..."}
    ]
  }'
```

## 🎨 Frontend MVP Milestones

### Phase 1: Basic UI Setup (2 days)
**Goal**: Create a functional web interface for the backend

**Deliverables**:
- [ ] Project setup with React + Tailwind
- [ ] Basic layout and routing
- [ ] GitHub URL input form
- [ ] Proficiency and depth selection
- [ ] Basic error handling and loading states

### Phase 2: Video Integration (2 days)
**Goal**: Connect frontend to video generation pipeline

**Deliverables**:
- [ ] Video player component
- [ ] Generation status tracking
- [ ] Download/share functionality
- [ ] Progress indicators

### Phase 3: Polish & UX (1 day)
**Goal**: Improve user experience and add final touches

**Deliverables**:
- [ ] Responsive design
- [ ] Loading animations
- [ ] Error messages and recovery
- [ ] Basic analytics tracking

## 🔄 Development Workflow

### Backend Development
1. Start with Phase 1 and ensure it's working end-to-end
2. Move to Phase 2 only after Phase 1 is stable
3. Implement Phase 3 with basic video generation first
4. Add optimizations and improvements after basic functionality

### Frontend Development
1. Begin after backend MVP is complete
2. Start with basic form and API integration
3. Add video player and status tracking
4. Polish UI/UX last

## 📊 Success Metrics

### Backend MVP
- Response time < 2 seconds for single file retrieval
- Response time < 5 seconds for directory retrieval
- Script generation < 10 seconds for single file
- Script generation < 30 seconds for directory
- Video generation < 2 minutes
- 99% uptime for core services

### Frontend MVP
- Page load time < 2 seconds
- Time to first video < 3 minutes
- Mobile responsiveness score > 90
- Error recovery rate > 95%

## 🛠 Tech Stack

### Backend
- FastAPI (Python)
- OpenAI/Claude API
- ElevenLabs API
- Redis (for job queue)
- S3/Similar for video storage

### Frontend
- React
- Tailwind CSS
- Axios for API calls
- React Query for state management

## ⚠️ Risk Mitigation

1. **API Rate Limits**
   - Implement caching for GitHub API calls
   - Queue system for video generation

2. **Cost Control**
   - Token usage monitoring
   - Rate limiting per user
   - Caching for repeated requests

3. **Performance**
   - Async processing for long-running tasks
   - Progress tracking for video generation
   - Fallback options for failed generations 